import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";
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

    normalizedKyc = {
      ...kyc,
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
    if (existing && ["UNDER_REVIEW", "VERIFIED", "APPROVED"].includes(existing.status)) {
      return NextResponse.json({ success: false, message: "KYC is already under review or verified." }, { status: 400 });
    }

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

    const cleanPan = body.panNumber ? body.panNumber.trim().toUpperCase() : '';
    const cleanAadhaar = body.aadhaarNumber ? body.aadhaarNumber.trim().replace(/\s|-/g, '') : '';

    const kycData = {
      memberId: member._id,
      userId: member.userId,
      mlmCode: member.mlmCode,
      fullName: body.fullName || member.fullName,
      panNumber: cleanPan,
      aadhaarNumber: cleanAadhaar,
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
      status: "PENDING",
      submittedAt: new Date(),
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

    await MlmMember.findByIdAndUpdate(member._id, {
      kycStatus: "PENDING",
      kycId: kyc._id,
    });

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully! Awaiting Admin approval.",
      data: { kyc },
      kyc,
    });
  } catch (error) {
    console.error("[MLM Submit KYC Error]", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to submit KYC" }, { status: 500 });
  }
}
