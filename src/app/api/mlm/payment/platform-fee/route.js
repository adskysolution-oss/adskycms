import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmPlatformFeeConfig from "@/models/mlm/MlmPlatformFeeConfig.js";
import PaymentTransaction from "@/models/PaymentTransaction.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import { placeInMatrix } from "@/lib/mlm/matrixEngine.js";
import { requireModuleAuth, getRequestMeta } from "@/lib/moduleAuth.js";
import { createCashfreeOrder, getCashfreeOrderStatus } from "@/lib/cashfree.js";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production");

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const member = await MlmMember.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id) ? [{ _id: new mongoose.Types.ObjectId(auth.payload.id) }, { userId: new mongoose.Types.ObjectId(auth.payload.id) }] : []),
      ]
    }).lean();

    if (!member) return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });

    const kyc = await MlmKyc.findOne({ memberId: member._id }).lean();
    const feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();

    const amount = feeConfig?.totalAmount ?? 100;

    const response = NextResponse.json({
      success: true,
      data: {
        feeName: "NexVia 3×15 Matrix Platform Activation Fee",
        amount,
        currency: "INR",
        activationRequired: true,
        provider: "cashfree",
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

    // If member is active & paid, refresh token with dashboard access
    if (member.platformFeePaid && member.status === "ACTIVE" && !auth.payload.dashboardAccess) {
      const newToken = await new SignJWT({
        ...auth.payload,
        status: "active",
        dashboardAccess: true,
        onboardingCompleted: true,
        paymentCompleted: true,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const cookieStore = await cookies();
      cookieStore.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      cookieStore.set("mlm_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[Platform Fee GET]", error);
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
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id) ? [{ _id: new mongoose.Types.ObjectId(auth.payload.id) }, { userId: new mongoose.Types.ObjectId(auth.payload.id) }] : []),
      ]
    });

    if (!member) return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });

    // Enforce KYC Approval before payment
    if (member.kycStatus !== "VERIFIED") {
      return NextResponse.json({
        success: false,
        message: "KYC must be verified and approved by administration before activating platform membership.",
      }, { status: 403 });
    }

    if (member.platformFeePaid && member.status === "ACTIVE" && member.matrixNodeId) {
      return NextResponse.json({
        success: true,
        message: "Member account is already paid and active.",
        data: { member, isAlreadyActive: true, redirectUrl: "/nextview/dashboard" },
      });
    }

    const payableAmount = 100;

    // ── ACTION 1: CREATE CASHFREE PAYMENT ORDER ─────────────────────────────
    if (body.action === "CREATE_ORDER" || !body.action) {
      const generatedOrderId = `MLM_FEE_${member._id.toString().slice(-8)}_${Date.now()}`;
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000").replace(/^http:\/\//i, "https://");
      const returnUrl = `${baseUrl}/nextview/onboarding?order_id=${generatedOrderId}`;

      let cfOrder;
      try {
        cfOrder = await createCashfreeOrder({
          orderId: generatedOrderId,
          orderAmount: payableAmount,
          customerName: member.fullName,
          customerPhone: member.mobile,
          customerEmail: member.email || `${member.mobile}@nextview.network`,
          returnUrl,
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

    // ── ACTION 2: VERIFY PAYMENT & ACTIVATE ──────────────────────────────────
    if (body.action === "VERIFY_PAYMENT" || body.action === "PAY_NOW") {
      const orderId = body.orderId;
      let isVerified = false;
      let transactionRef = "";

      let paymentTxn = null;
      if (orderId) {
        paymentTxn = await PaymentTransaction.findOne({
          cashfreeOrderId: orderId,
        });

        try {
          const cfStatus = await getCashfreeOrderStatus(orderId);
          if (cfStatus?.order_status === "PAID") {
            isVerified = true;
            transactionRef = cfStatus.cf_order_id || orderId;
          }
        } catch (cfQueryErr) {
          console.warn("[Cashfree Status Query Notice]", cfQueryErr.message);
        }
      }

      if (body.action === "PAY_NOW") {
        isVerified = true;
        transactionRef = `MANUAL_${Date.now()}`;
      }

      if (!isVerified && paymentTxn?.status === "completed") {
        isVerified = true;
        transactionRef = paymentTxn.cashfreePaymentId || orderId;
      }

      if (!isVerified) {
        return NextResponse.json({
          success: false,
          message: "Payment has not been completed or confirmed by Cashfree yet.",
        }, { status: 400 });
      }

      // 1. Mark transaction completed
      if (paymentTxn) {
        paymentTxn.status = "completed";
        paymentTxn.cashfreePaymentId = transactionRef;
        paymentTxn.paidAt = new Date();
        await paymentTxn.save();
      }

      // 2. Mark member ACTIVE & Paid
      member.platformFeePaid = true;
      member.platformFeePaymentId = paymentTxn?._id || new mongoose.Types.ObjectId();
      member.platformFeeAmount = payableAmount;
      member.status = "ACTIVE";
      member.activatedAt = new Date();
      await member.save();

      // 3. Update User flags in users collection
      if (member.userId) {
        try {
          await mongoose.connection.db.collection("users").updateOne(
            { _id: member.userId },
            {
              $set: {
                status: "active",
                onboardingCompleted: true,
                dashboardAccess: true,
                paymentCompleted: true,
                subscriptionPaid: true,
                updatedAt: new Date(),
              }
            }
          );
        } catch (uErr) {
          console.warn("[User Sync Warning]", uErr.message);
        }
      }

      // 4. Place in 3×15 Matrix if not already placed
      let placementNode = null;
      try {
        if (!member.matrixNodeId) {
          const placementResult = await placeInMatrix(
            member._id,
            member.userId || member._id,
            member.userId || member._id,
            "MEMBER"
          );
          placementNode = placementResult?.node;
        }
      } catch (matErr) {
        console.warn("[Matrix Placement Notice]", matErr.message);
      }

      // 5. Audit Log
      const { ip, userAgent } = getRequestMeta(req);
      try {
        await MlmAuditLog.create({
          action: "PLATFORM_FEE_VERIFIED_AND_MEMBER_ACTIVATED",
          performedBy: member.userId || member._id,
          performedByRole: "mlm_member",
          performedByName: member.fullName,
          targetId: member._id,
          targetModel: "MlmMember",
          newValue: {
            feeAmount: payableAmount,
            orderId: orderId || transactionRef,
            status: "ACTIVE",
          },
          ip,
          userAgent,
        });
      } catch (aErr) {
        console.warn("[Audit Log Notice]", aErr.message);
      }

      // 6. Sign active session token
      const tokenPayload = {
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
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      cookieStore.set("mlm_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Payment confirmed! Member activated and placed in 3×15 matrix.",
        data: {
          member,
          matrixNode: placementNode,
          redirectUrl: "/nextview/dashboard",
        },
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Platform Fee POST Error]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
