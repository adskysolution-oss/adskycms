import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { code } = await params;

    if (!code || code.length !== 11) {
      return NextResponse.json(
        { success: false, message: 'Invalid IFSC code. Must be 11 characters.' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const res = await fetch(`https://ifsc.razorpay.com/${cleanCode}`, {
      headers: { 'User-Agent': 'AdSkyCMS/1.0' },
      next: { revalidate: 86400 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'IFSC code not found or invalid.' },
        { status: 404 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      message: 'Bank details fetched successfully',
      data: {
        ifsc: cleanCode,
        bankName: data.BANK || data.bank || '',
        branch: data.BRANCH || data.branch || '',
        city: data.CITY || data.city || '',
        district: data.DISTRICT || data.district || '',
        state: data.STATE || data.state || '',
        address: data.ADDRESS || data.address || '',
        contact: data.CONTACT || '',
        micr: data.MICR || '',
        upi: data.UPI || true,
      },
    });
  } catch (error) {
    console.error('IFSC API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching IFSC details.' },
      { status: 500 }
    );
  }
}