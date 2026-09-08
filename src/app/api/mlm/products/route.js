import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmProduct from '@/models/mlm/MlmProduct';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import mongoose from 'mongoose';
/**
 * GET /api/mlm/products
 * Lists FD / FD_CARD products.
 * Public/Members get ACTIVE products. Admins can pass ?all=true to see all statuses.
 */
export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const all = searchParams.get('all') === 'true';
    const filter = {};
    if (!all) {
        filter.status = 'ACTIVE';
    }
    if (type)
        filter.type = type;
    const products = await MlmProduct.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();
    return NextResponse.json({ success: true, data: products });
}
/**
 * POST /api/mlm/products [Admin only]
 * Creates a new FD/FD-CARD product.
 */
export async function POST(req) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse)
        return auth;
    const body = await req.json();
    const { name, slug, type, providerName, description, benefits, eligibility, terms, faq, referralUrl, applicationUrl, interestRate, trackingCode, minAmount, maxAmount, displayOrder, status } = body;
    if (!name || !slug || !type) {
        return NextResponse.json({ success: false, message: 'name, slug, and type are required' }, { status: 400 });
    }
    const effectiveAppUrl = applicationUrl || referralUrl;
    const product = await MlmProduct.create({
        name,
        slug: slug.toLowerCase().trim(),
        type,
        providerName,
        description,
        benefits: Array.isArray(benefits) ? benefits : typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : [],
        eligibility,
        terms,
        faq,
        referralUrl: effectiveAppUrl,
        applicationUrl: effectiveAppUrl,
        interestRate: interestRate || 'Up to 8.5% p.a.',
        trackingCode,
        minAmount: minAmount ? Number(minAmount) : 10000,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        status: status || 'ACTIVE',
        createdBy: (mongoose.Types.ObjectId.isValid(auth.payload?.id) ? new mongoose.Types.ObjectId(auth.payload.id) : new mongoose.Types.ObjectId()),
    });
    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
        action: 'PRODUCT_CREATED',
        performedBy: (mongoose.Types.ObjectId.isValid(auth.payload?.id) ? new mongoose.Types.ObjectId(auth.payload.id) : new mongoose.Types.ObjectId()),
        performedByRole: auth.payload.role,
        performedByName: auth.payload.fullName || 'Admin',
        targetId: product._id,
        targetModel: 'MlmProduct',
        newValue: { name, slug, type, referralUrl: effectiveAppUrl, status: product.status },
        ip,
        userAgent,
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
}
/**
 * PUT /api/mlm/products [Admin only]
 * Updates an existing FD/FD-CARD product.
 */
export async function PUT(req) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse)
        return auth;
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
        return NextResponse.json({ success: false, message: 'Product id is required' }, { status: 400 });
    }
    if (updates.applicationUrl || updates.referralUrl) {
        const url = updates.applicationUrl || updates.referralUrl;
        updates.referralUrl = url;
        updates.applicationUrl = url;
    }
    if (updates.benefits && typeof updates.benefits === 'string') {
        updates.benefits = updates.benefits.split('\n').filter(Boolean);
    }
    const updatedProduct = await MlmProduct.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProduct) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
        action: 'PRODUCT_UPDATED',
        performedBy: (mongoose.Types.ObjectId.isValid(auth.payload?.id) ? new mongoose.Types.ObjectId(auth.payload.id) : new mongoose.Types.ObjectId()),
        performedByRole: auth.payload.role,
        performedByName: auth.payload.fullName || 'Admin',
        targetId: updatedProduct._id,
        targetModel: 'MlmProduct',
        newValue: updates,
        ip,
        userAgent,
    });
    return NextResponse.json({ success: true, data: updatedProduct });
}
