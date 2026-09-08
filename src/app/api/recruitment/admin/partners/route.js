import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentPartner from "@/models/recruitment/RecruitmentPartner.js";
import RecruitmentAuditLog from "@/models/recruitment/RecruitmentAuditLog.js";
import { authenticateRequest } from "@/lib/auth.js";

export const dynamic = "force-dynamic";

async function requireAdmin(req) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
  return user;
}

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [
    { companyName: { $regex: search, $options: "i" } },
    { contactPerson: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { partnerCode: { $regex: search, $options: "i" } },
  ];
  const partners = await RecruitmentPartner.find(filter).select("-password -otp").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, partners });
}

export async function PATCH(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  try {
    await dbConnect();
    const { partnerId, action, rejectionReason } = await req.json();
    const partner = await RecruitmentPartner.findById(partnerId);
    if (!partner) return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });

    if (action === "APPROVE") {
      partner.status = "active";
      partner.dashboardAccess = true;
      partner.verifiedAt = new Date();
      partner.verifiedBy = admin.email;
      partner.timeline.push({ event: "APPROVED", actor: admin.email, timestamp: new Date() });
    } else if (action === "REJECT") {
      partner.status = "rejected";
      partner.rejectedAt = new Date();
      partner.rejectedBy = admin.email;
      partner.rejectionReason = rejectionReason;
      partner.dashboardAccess = false;
    } else if (action === "SUSPEND") {
      partner.status = "suspended";
      partner.dashboardAccess = false;
    } else if (action === "ACTIVATE") {
      partner.status = "active";
      partner.dashboardAccess = true;
    }

    await partner.save();

    await RecruitmentAuditLog.create({ action: `PARTNER_${action}`, adminEmail: admin.email, partnerId: partner._id, details: { action, rejectionReason } });

    return NextResponse.json({ success: true, message: `Partner ${action.toLowerCase()}d.`, partner });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
