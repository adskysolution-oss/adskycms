import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmPlatformFeeConfig from "@/models/mlm/MlmPlatformFeeConfig.js";
import PaymentTransaction from "@/models/PaymentTransaction.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";
import { createCashfreeOrder, getCashfreeOrderStatus } from "@/lib/cashfree.js";
import { getTrustedBaseUrl } from "@/lib/baseUrl.js";
import { reconcilePayment } from "@/lib/mlm/paymentReconciler.js";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

/**
 * Signs and sets active authentication cookies for an activated member.
 */
async function issueMlmAuthCookies(member, existingPayload = {}) {
  const tokenPayload = {
    ...existingPayload,
    id: member._id.toString(),
    userId: member.userId ? member.userId.toString() : member._id.toString(),
    mlmCode: member.mlmCode,
    role: "mlm_member",
    fullName: member.fullName,
    mobile: member.mobile,
    email: member.email,
    status: "active",
    dashboardAccess: true,
    onboardingCompleted: true,
    paymentCompleted: true,
  };

  const token = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  cookieStore.set("token", token, cookieOpts);
  cookieStore.set("mlm_token", token, cookieOpts);
  return token;
}

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    let member = await MlmMember.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id)
          ? [
              { _id: new mongoose.Types.ObjectId(auth.payload.id) },
              { userId: new mongoose.Types.ObjectId(auth.payload.id) },
            ]
          : []),
      ],
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    // ── AUTO-SYNC: If member is not yet active/paid, check for pending Cashfree payment ──
    if (!member.platformFeePaid || member.status !== "ACTIVE" || !member.matrixNodeId) {
      const pendingTxn = await PaymentTransaction.findOne({
        userId: member.userId || member._id,
        type: "platform_fee",
        businessModule: "mlm",
        status: { $in: ["created", "pending"] },
      }).sort({ createdAt: -1 });

      if (pendingTxn && pendingTxn.cashfreeOrderId) {
        try {
          const cfStatus = await getCashfreeOrderStatus(pendingTxn.cashfreeOrderId);
          if (cfStatus?.order_status === "PAID") {
            const syncRes = await reconcilePayment({
              member,
              txnOrOrderId: pendingTxn,
              cfOrderData: cfStatus,
              source: "get_auto_sync",
              req,
            });

            if (syncRes.success) {
              const fresh = await MlmMember.findById(member._id);
              if (fresh) member = fresh;
            }
          }
        } catch (cfErr) {
          console.warn("[Platform Fee GET Auto-Sync Notice]", cfErr.message);
        }
      }
    }

    const kyc = await MlmKyc.findOne({ memberId: member._id }).lean();
    const feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();
    const amount = feeConfig?.totalAmount ?? 100;

    const response = NextResponse.json({
      success: true,
      data: {
        feeName: feeConfig?.description || "NexVia 3×15 Matrix Platform Activation Fee",
        feeDescription: feeConfig?.description || "Lifetime Membership & 3×15 Matrix Placement",
        amount,
        currency: "INR",
        activationRequired: true,
        provider: feeConfig?.paymentProvider || "adsky_cashfree",
        environment: process.env.CASHFREE_ENV || "production",
        member: {
          _id: member._id,
          mlmCode: member.mlmCode,
          fullName: member.fullName,
          status: member.status,
          kycStatus: member.kycStatus,
          platformFeePaid: !!member.platformFeePaid,
          matrixNodeId: member.matrixNodeId,
        },
        kyc: kyc ? { status: kyc.status, submittedAt: kyc.submittedAt } : null,
      },
    });

    // If member is active & paid, refresh token with dashboard access if not already present
    if (member.platformFeePaid && member.status === "ACTIVE" && !auth.payload.dashboardAccess) {
      await issueMlmAuthCookies(member, auth.payload);
    }

    return response;
  } catch (error) {
    console.error("[Platform Fee GET Error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const member = await MlmMember.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id)
          ? [
              { _id: new mongoose.Types.ObjectId(auth.payload.id) },
              { userId: new mongoose.Types.ObjectId(auth.payload.id) },
            ]
          : []),
      ],
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    // Enforce KYC Approval before payment
    if (member.kycStatus !== "VERIFIED") {
      return NextResponse.json({
        success: false,
        message: "KYC must be verified and approved by administration before activating platform membership.",
      }, { status: 403 });
    }

    const feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();
    const payableAmount = Number(feeConfig?.totalAmount ?? feeConfig?.feeAmount ?? 100);

    // ── ACTION 1: CREATE CASHFREE PAYMENT ORDER ─────────────────────────────
    if (body.action === "CREATE_ORDER" || !body.action) {
      if (member.platformFeePaid && member.status === "ACTIVE" && member.matrixNodeId) {
        return NextResponse.json({
          success: true,
          message: "Member account is already paid and active.",
          data: { member, isAlreadyActive: true, redirectUrl: "/nextview/dashboard" },
        });
      }

      const generatedOrderId = `MLM_FEE_${member._id.toString().slice(-8)}_${Date.now()}`;
      const baseUrl = getTrustedBaseUrl();
      const returnUrl = `${baseUrl}/nextview/onboarding?order_id=${generatedOrderId}`;
      const notifyUrl = `${baseUrl}/api/mlm/payment/webhook`;

      let cfOrder;
      try {
        cfOrder = await createCashfreeOrder({
          orderId: generatedOrderId,
          orderAmount: payableAmount,
          customerName: member.fullName,
          customerPhone: member.mobile,
          customerEmail: member.email || `${member.mobile}@nextview.network`,
          returnUrl,
          notifyUrl,
        });
      } catch (cfErr) {
        console.error("[Cashfree Order Creation Error]", cfErr);
        return NextResponse.json({
          success: false,
          message: cfErr.message || "Failed to create Cashfree payment order.",
        }, { status: 500 });
      }

      // Record pending PaymentTransaction
      await PaymentTransaction.create({
        userId: member.userId || member._id,
        role: "mlm_member",
        type: "platform_fee",
        amount: payableAmount,
        currency: "INR",
        cashfreeOrderId: generatedOrderId,
        paymentSessionId: cfOrder.payment_session_id,
        status: "pending",
        provider: "cashfree",
        organization: "adsky",
        planName: `NextView Platform Fee (₹${payableAmount}) for ${member.mlmCode}`,
        businessModule: "mlm",
        entityType: "mlm",
      });

      return NextResponse.json({
        success: true,
        message: "Payment order generated successfully",
        data: {
          orderId: generatedOrderId,
          paymentSessionId: cfOrder.payment_session_id,
          provider: "cashfree",
          amount: payableAmount,
          currency: "INR",
          environment: process.env.CASHFREE_ENV || "production",
        },
      });
    }

    // ── ACTION 2: VERIFY PAYMENT (REMOVED PAY_NOW BACKDOOR) ───────────────────
    if (body.action === "VERIFY_PAYMENT") {
      let orderId = body.orderId;
      let targetTxn = null;

      if (orderId) {
        targetTxn = await PaymentTransaction.findOne({ cashfreeOrderId: orderId });
      }

      // Fallback: If orderId is missing, resolve member's latest pending platform-fee transaction
      if (!targetTxn) {
        targetTxn = await PaymentTransaction.findOne({
          userId: member.userId || member._id,
          type: "platform_fee",
          businessModule: "mlm",
          status: { $in: ["created", "pending"] },
        }).sort({ createdAt: -1 });

        if (targetTxn) {
          orderId = targetTxn.cashfreeOrderId;
        }
      }

      if (!orderId && !targetTxn) {
        return NextResponse.json({
          success: false,
          result: "NOT_FOUND",
          message: "No pending payment transaction found to verify.",
        }, { status: 404 });
      }

      // Reconcile via centralized idempotent state-repair reconciler
      const reconcileResult = await reconcilePayment({
        member,
        txnOrOrderId: targetTxn || orderId,
        source: "verify_payment",
        req,
      });

      if (reconcileResult.success) {
        await issueMlmAuthCookies(reconcileResult.member || member, auth.payload);

        return NextResponse.json({
          success: true,
          result: reconcileResult.result,
          message: "Payment confirmed! Member activated and placed in 3×15 matrix.",
          data: {
            member: reconcileResult.member,
            matrixNode: reconcileResult.matrixNode,
            redirectUrl: "/nextview/dashboard",
          },
        });
      }

      return NextResponse.json({
        success: false,
        result: reconcileResult.result || "PENDING",
        message: reconcileResult.message || "Payment has not been completed or confirmed by Cashfree yet.",
      }, { status: 400 });
    }

    // ── ACTION 3: CHECK_STATUS (SELF-RECOVERY / RECHECK) ──────────────────────
    if (body.action === "CHECK_STATUS") {
      // Find latest platform fee transaction for authenticated member
      const latestTxn = await PaymentTransaction.findOne({
        userId: member.userId || member._id,
        type: "platform_fee",
        businessModule: "mlm",
      }).sort({ createdAt: -1 });

      if (!latestTxn) {
        if (member.platformFeePaid && member.status === "ACTIVE") {
          return NextResponse.json({
            success: true,
            result: "ALREADY_SYNCED",
            message: "Member is already active.",
            data: { member, redirectUrl: "/nextview/dashboard" },
          });
        }
        return NextResponse.json({
          success: false,
          result: "NOT_FOUND",
          message: "No payment transaction found for this member.",
        }, { status: 404 });
      }

      const reconcileResult = await reconcilePayment({
        member,
        txnOrOrderId: latestTxn,
        source: "check_status",
        req,
      });

      if (reconcileResult.success) {
        await issueMlmAuthCookies(reconcileResult.member || member, auth.payload);

        return NextResponse.json({
          success: true,
          result: reconcileResult.result,
          message: "Payment confirmed and account active!",
          data: {
            member: reconcileResult.member,
            matrixNode: reconcileResult.matrixNode,
            redirectUrl: "/nextview/dashboard",
          },
        });
      }

      return NextResponse.json({
        success: false,
        result: reconcileResult.result || "PENDING",
        message: reconcileResult.message || "Payment has not been confirmed by Cashfree yet.",
      }, { status: reconcileResult.result === "NOT_FOUND" ? 404 : 200 });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Platform Fee POST Error]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
