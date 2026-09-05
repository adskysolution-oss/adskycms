import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Job from '@/models/Job';
import Application from '@/models/Application';

export async function GET() {
  try {
    await dbConnect();

    // 1. Fetch Stats
    const [
      totalUsers,
      activeUsers,
      totalBlogs,
      totalJobs,
      totalApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Blog.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    // 2. User Growth Data (Last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Application Distribution by Status
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalBlogs,
        totalJobs,
        totalApplications,
      },
      userGrowth,
      applicationStats: applicationStats.reduce((acc, curr) => {
        acc[curr._id || 'pending'] = curr.count;
        return acc;
      }, {}),
    });

  } catch (error) {
    console.error('Admin Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
