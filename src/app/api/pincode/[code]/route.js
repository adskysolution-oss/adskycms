import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { code } = await params;

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid pincode. Must be 6 digits.' },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      headers: { 'User-Agent': 'AdSkyCMS/1.0' },
      next: { revalidate: 86400 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to connect to PIN code service.' },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data || !data[0] || data[0].Status === 'Error' || !data[0].PostOffice || data[0].PostOffice.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pincode not found.' },
        { status: 404 }
      );
    }

    const postOffice = data[0].PostOffice[0];
    const areas = data[0].PostOffice.map((po) => po.Name);

    return NextResponse.json({
      success: true,
      message: 'Pincode data fetched successfully',
      data: {
        pincode: code,
        district: postOffice.District || '',
        state: postOffice.State || '',
        block: postOffice.Block || postOffice.Taluk || '',
        area: areas,
      },
    });
  } catch (error) {
    console.error('Pincode API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching PIN code.' },
      { status: 500 }
    );
  }
}