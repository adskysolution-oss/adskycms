import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmMarketing from "@/models/mlm/MlmMarketing.js";
import { uploadImage } from "@/lib/cloudinary.js";
import { authenticateRequest } from "@/lib/auth.js";

export const dynamic = "force-dynamic";

async function requireAdmin(req) {
  const user = await authenticateRequest(req);
  if (!user || !['admin', 'super_admin', 'operations_admin'].includes(user.role)) return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
  return user;
}

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await dbConnect();
  const materials = await MlmMarketing.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json({ success: true, materials });
}

export async function POST(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  try {
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get("file");
    let url = formData.get("url");

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await uploadImage(base64, "nextview/marketing");
      if (result.success) url = result.url;
    }

    const material = await MlmMarketing.create({
      title: formData.get("title"),
      contentType: formData.get("contentType"),
      url,
      caption: formData.get("caption"),
      tags: formData.get("tags") ? JSON.parse(formData.get("tags")) : [],
      isActive: true,
      uploadedBy: admin.email,
    });

    return NextResponse.json({ success: true, material });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
  await dbConnect();
  await MlmMarketing.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Deleted." });
}
