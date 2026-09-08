import '@/models/User';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MlmMember from '@/models/mlm/MlmMember';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(request) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(request, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim();
        const kycStatus = searchParams.get('kycStatus')?.trim();
        const status = searchParams.get('status')?.trim();
        const state = searchParams.get('state')?.trim();
        const district = searchParams.get('district')?.trim();
        const pincode = searchParams.get('pincode')?.trim();
        const platformFeePaid = searchParams.get('platformFeePaid');
        const query = {};
        if (kycStatus)
            query.kycStatus = kycStatus;
        if (status)
            query.status = status;
        if (state)
            query.state = { $regex: new RegExp(`^${state}$`, 'i') };
        if (district)
            query.district = { $regex: new RegExp(`^${district}$`, 'i') };
        if (pincode)
            query.pincode = pincode;
        if (platformFeePaid !== null && platformFeePaid !== undefined && platformFeePaid !== '') {
            query.platformFeePaid = platformFeePaid === 'true';
        }
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { mlmCode: { $regex: search, $options: 'i' } },
                { sponsorCode: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { district: { $regex: search, $options: 'i' } },
                { pincode: { $regex: search, $options: 'i' } },
            ];
        }
        const members = await MlmMember.find(query)
            .populate('userId', 'email mobile status')
            .sort({ joinedAt: -1, createdAt: -1 })
            .lean();
        return NextResponse.json({
            success: true,
            data: members,
            count: members.length,
        });
    }
    catch (error) {
        console.error('Error fetching MLM members:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
