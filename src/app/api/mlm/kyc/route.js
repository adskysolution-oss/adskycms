import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";
import { maskPan, maskAadhaar } from "@/lib/verification/masking.js";
import { atomicCheckAndApproveKyc } from "@/lib/verification/kycTransition.js";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  
  const member = await MlmMember.findOne({
    $or: [
      ...(mongoose.Types.ObjectId.isValid(auth.payload.id) ? [{ _id: new mongoose.Types.ObjectId(auth.payload.id) }, { userId: new mongoose.Types.ObjectId(auth.payload.id) }] : []),
    ]
  }).lean();

  if (!member) {
    return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
  }

  const kyc = await MlmKyc.findOne({ memberId: member._id }).lean();
  
  // Normalize bankDetails in response
  let normalizedKyc = kyc;
  if (kyc) {
    const b = kyc.bankDetails || {};
    const acctNum = b.accountNumber || kyc.bankAccountNumber || '';
    const ifsc = b.ifscCode || kyc.bankIfscCode || '';
    const bName = b.bankName || kyc.bankName || '';
    const branch = b.branchName || kyc.bankBranch || '';
    const holder = b.accountHolderName || kyc.accountHolderName || kyc.fullName || member.fullName || '';
    const upi = b.upiId || kyc.upiId || '';

    // SECURITY: Delete server-side verification session secrets
    const safeAadhaarVerification = kyc.aadhaarVerification ? { ...kyc.aadhaarVerification } : null;
    if (safeAadhaarVerification) {
      delete safeAadhaarVerification.referenceId;
      delete safeAadhaarVerification.referenceIdExpiresAt;
    }

    normalizedKyc = {
      ...kyc,
      aadhaarVerification: safeAadhaarVerification,
      maskedPan: maskPan(kyc.panNumber),
      maskedAadhaar: maskAadhaar(kyc.aadhaarNumber),
      bankDetails: (acctNum || ifsc) ? {
        accountHolderName: holder,
        accountNumber: acctNum,
        ifscCode: ifsc,
        bankName: bName,
        branchName: branch,
        upiId: upi,
      } : null,
      bankAccountNumber: acctNum,
      bankIfscCode: ifsc,
      bankName: bName,
      bankBranch: branch,
      accountHolderName: holder,
    };
  }

  return NextResponse.json({
    success: true,
    kyc: normalizedKyc ?? null,
    data: {
      kyc: normalizedKyc ?? null,
      member: {
        _id: member._id,
        fullName: member.fullName,
        mobile: member.mobile,
        mlmCode: member.mlmCode,
        kycStatus: member.kycStatus,
        status: member.status,
        platformFeePaid: member.platformFeePaid,
      }
    }
  });
}

export async function POST(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const member = await MlmMember.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id) ? [{ _id: new mongoose.Types.ObjectId(auth.payload.id) }, { userId: new mongoose.Types.ObjectId(auth.payload.id) }] : []),
      ]
    });
    if (!member) return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });

    const existing = await MlmKyc.findOne({ memberId: member._id });

    let body = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    const holder = body.bankDetails?.accountHolderName || body.accountHolderName || body.fullName || member.fullName;
    const acctNum = body.bankDetails?.accountNumber || body.bankAccountNumber || '';
    const ifsc = body.bankDetails?.ifscCode || body.bankIfscCode || '';
    const bName = body.bankDetails?.bankName || body.bankName || '';
    const branch = body.bankDetails?.branchName || body.bankBranch || body.branchName || '';
    const upi = body.bankDetails?.upiId || body.upiId || '';

    const cleanPan = body.panNumber ? body.panNumber.trim().toUpperCase() : (existing?.panNumber || '');
    const cleanAadhaar = body.aadhaarNumber ? body.aadhaarNumber.trim().replace(/\s|-/g, '') : (existing?.aadhaarNumber || '');
    const cleanDob = body.dob ? body.dob.trim() : (existing?.dob || '');

    // Check existing bank status
    const existingHasBank = Boolean(
      (existing?.bankAccountNumber?.trim() || existing?.bankDetails?.accountNumber?.trim()) &&
      (existing?.bankIfscCode?.trim() || existing?.bankDetails?.ifscCode?.trim())
    );
    const isAlreadyFullyVerified = existing?.status === "VERIFIED" && existingHasBank;
    const newStatus = isAlreadyFullyVerified ? "VERIFIED" : "PENDING";

    const kycData = {
      memberId: member._id,
      userId: member.userId,
      mlmCode: member.mlmCode,
      fullName: body.fullName || member.fullName,
      panNumber: cleanPan,
      aadhaarNumber: cleanAadhaar,
      dob: cleanDob,
      bankDetails: {
        accountHolderName: holder ? holder.trim() : '',
        accountNumber: acctNum ? acctNum.trim() : '',
        ifscCode: ifsc ? ifsc.trim().toUpperCase() : '',
        bankName: bName ? bName.trim() : '',
        branchName: branch ? branch.trim() : '',
        upiId: upi ? upi.trim() : '',
      },
      bankAccountNumber: acctNum ? acctNum.trim() : '',
      bankIfscCode: ifsc ? ifsc.trim().toUpperCase() : '',
      bankName: bName ? bName.trim() : '',
      bankBranch: branch ? branch.trim() : '',
      accountHolderName: holder ? holder.trim() : '',
      status: newStatus,
      submittedAt: existing?.submittedAt || new Date(),
    };

    let kyc;
    if (existing) {
      kyc = await MlmKyc.findByIdAndUpdate(
        existing._id,
        { ...kycData },
        { new: true }
      );
    } else {
      kyc = await MlmKyc.create(kycData);
    }

    // Trigger atomic KYC approval check (will verify if PAN + Aadhaar + Bank details are all complete)
    const transition = await atomicCheckAndApproveKyc({
      kycId: kyc._id,
      memberId: member._id,
      source: kyc.verificationSource || "AUTOMATIC_APITXT",
      req,
    });

    const freshKyc = transition?.kyc || kyc;
    const isNowVerified = freshKyc.status === "VERIFIED";

    if (!isNowVerified) {
      await MlmMember.findByIdAndUpdate(member._id, {
        kycStatus: "PENDING",
        kycId: kyc._id,
      });
    }

    let message = "KYC submitted successfully!";
    if (isNowVerified) {
      message = "Bank details and KYC verified successfully! You can now proceed to platform activation.";
    } else if (transition?.pending === "PAN") {
      message = "Bank details saved. Please complete PAN verification.";
    } else if (transition?.pending === "AADHAAR") {
      message = "Bank details saved. Please complete Aadhaar OTP verification.";
    } else {
      message = "Bank details saved successfully.";
    }

    return NextResponse.json({
      success: true,
      message,
      data: { kyc: freshKyc },
      kyc: freshKyc,
      isVerified: isNowVerified,
    });
  } catch (error) {
    console.error("[MLM Submit KYC Error]", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to submit KYC" }, { status: 500 });
  }
}
