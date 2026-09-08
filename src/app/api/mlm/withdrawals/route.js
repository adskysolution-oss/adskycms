import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmWithdrawal from "@/models/mlm/MlmWithdrawal.js";
import MlmWallet from "@/models/mlm/MlmWallet.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { debitWithdrawal } from "@/lib/mlm/walletEngine.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const withdrawals = await MlmWithdrawal.find({ memberId: auth.payload.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    success: true,
    withdrawals: withdrawals || [],
    data: {
      withdrawals: withdrawals || [],
    }
  });
}

export async function POST(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const { amount, paymentMode, bankAccountNumber, bankIfscCode, bankName, accountHolderName, upiId } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return NextResponse.json({ success: false, message: "Minimum withdrawal amount is ₹100." }, { status: 400 });

    const member = await MlmMember.findById(auth.payload.id).lean();
    if (!member || member.status !== "ACTIVE") return NextResponse.json({ success: false, message: "Only active members can request withdrawals." }, { status: 403 });
    if (member.kycStatus !== "VERIFIED") return NextResponse.json({ success: false, message: "KYC must be verified before withdrawing." }, { status: 403 });

    const wallet = await MlmWallet.findOne({ memberId: auth.payload.id }).lean();
    const currentBal = wallet?.currentBalance ?? wallet?.balance ?? 0;
    if (!wallet || numAmount > currentBal) return NextResponse.json({ success: false, message: "Insufficient withdrawable balance." }, { status: 400 });

    const withdrawal = await MlmWithdrawal.create({
      memberId: auth.payload.id,
      walletId: wallet._id,
      amount: numAmount,
      paymentMode: paymentMode || "BANK_TRANSFER",
      bankAccountNumber,
      bankIfscCode,
      bankName,
      accountHolderName,
      upiId,
      status: "PENDING",
    });

    try {
      await debitWithdrawal(auth.payload.id, numAmount, withdrawal._id, "Withdrawal request submitted");
    } catch (e) {
      // fallback manual debit if debitWithdrawal helper is not available
      await MlmWallet.findByIdAndUpdate(wallet._id, {
        $inc: { currentBalance: -numAmount, balance: -numAmount, totalWithdrawn: numAmount }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal,
      data: { withdrawal }
    });
  } catch (error) {
    console.error("[MLM Withdrawal]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
