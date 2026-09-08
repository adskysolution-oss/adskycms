import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmShareConfig from '@/models/mlm/MlmShareConfig';
import { DEFAULT_SHARE_MESSAGE } from '@/constants/mlmShare';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth } from '@/lib/moduleAuth';
export const dynamic = 'force-dynamic';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        let config = await MlmShareConfig.findOne({ key: 'default' }).lean();
        if (!config) {
            config = {
                key: 'default',
                title: 'NEXVIA Referral WhatsApp Share',
                messageTemplate: DEFAULT_SHARE_MESSAGE,
                posterUrl: '',
                posterTitle: 'NEXVIA Official Promotional Poster',
                includePosterUrlInText: false,
                isActive: true,
            };
        }
        else if (config.posterUrl) {
            // Extract clean raw S3 URL (strip presigned params if DB has old signed URL)
            let rawPosterUrl = config.posterUrl;
            if (rawPosterUrl.includes('X-Amz-Signature') || rawPosterUrl.includes('x-amz-signature')) {
                try {
                    const urlObj = new URL(rawPosterUrl);
                    rawPosterUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
                }
                catch { /* keep as-is */ }
            }
            const signMediaUrl = async (u) => u;
            const signedUrl = await signMediaUrl(rawPosterUrl);
            config = {
                ...config,
                rawPosterUrl,
                posterUrl: signedUrl,
            };
        }
        return NextResponse.json({ success: true, data: config });
    }
    catch (error) {
        console.error('Error in admin GET MLM share config:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { payload } = auth;
        const body = await req.json();
        const { title, messageTemplate, posterUrl, posterPublicId, posterTitle, includePosterUrlInText, isActive, } = body;
        // Strip presigned query params to always store raw S3 URL in DB
        let cleanPosterUrl = posterUrl ?? '';
        if (cleanPosterUrl && (cleanPosterUrl.includes('X-Amz-Signature') || cleanPosterUrl.includes('x-amz-signature'))) {
            try {
                const urlObj = new URL(cleanPosterUrl);
                cleanPosterUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
            }
            catch {
                // keep as-is if URL parse fails
            }
        }
        const updated = await MlmShareConfig.findOneAndUpdate({ key: 'default' }, {
            key: 'default',
            title: title || 'NEXVIA Referral WhatsApp Share',
            messageTemplate: messageTemplate ?? DEFAULT_SHARE_MESSAGE,
            posterUrl: cleanPosterUrl,
            posterPublicId: posterPublicId ?? '',
            posterTitle: posterTitle ?? 'NEXVIA Official Promotional Poster',
            includePosterUrlInText: includePosterUrlInText === true,
            isActive: isActive !== false,
            updatedBy: payload.id || payload.email || 'admin',
            updatedAt: new Date(),
        }, { upsert: true, new: true });
        try {
            await MlmAuditLog.create({
                action: 'UPDATE_SHARE_CONFIG',
                adminId: payload.id,
                adminEmail: payload.email || 'admin@sakhihub.com',
                details: {
                    title: updated.title,
                    hasPoster: !!updated.posterUrl,
                    posterUrl: updated.posterUrl,
                    includePosterUrlInText: updated.includePosterUrlInText,
                },
            });
        }
        catch (auditErr) {
            console.warn('MLM Audit Log warning:', auditErr.message);
        }
        // Extract the raw (unsigned) S3 URL before signing
        const rawPosterUrl = updated.posterUrl || '';
        const signMediaUrl = async (u) => u;
        const signedPosterUrl = rawPosterUrl ? await signMediaUrl(rawPosterUrl) : '';
        return NextResponse.json({
            success: true,
            data: {
                ...updated.toObject(),
                rawPosterUrl,
                posterUrl: signedPosterUrl,
            },
            message: 'WhatsApp referral template and poster saved successfully',
        });
    }
    catch (error) {
        console.error('Error in admin POST MLM share config:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
