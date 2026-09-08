import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmTraining from '@/models/mlm/MlmTraining';
import MlmMarketing from '@/models/mlm/MlmMarketing';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const [trainings, materials] = await Promise.all([
            MlmTraining.find().sort({ order: 1, createdAt: -1 }).lean(),
            MlmMarketing.find().sort({ createdAt: -1 }).lean(),
        ]);
        return NextResponse.json({
            success: true,
            data: {
                trainings,
                materials,
            },
        });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const body = await req.json();
        const { type, title, description, category, videoUrl, fileUrl, content } = body;
        if (!title) {
            return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
        }
        if (type === 'MARKETING') {
            const item = await MlmMarketing.create({
                title,
                description,
                type: category || 'BANNER',
                fileUrl,
                content,
                isActive: true,
            });
            return NextResponse.json({ success: true, data: item, message: 'Marketing asset created' });
        }
        else {
            const item = await MlmTraining.create({
                title,
                description,
                category: category || 'GENERAL',
                videoUrl,
                fileUrl,
                content,
                isActive: true,
            });
            return NextResponse.json({ success: true, data: item, message: 'Training module created' });
        }
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
