import ActivityLog from '@/models/ActivityLog';
import dbConnect from './db';

export const logActivity = async ({ userId, action, details, req }) => {
  try {
    await dbConnect();
    
    const ip = req ? req.headers.get('x-forwarded-for') || req.ip : 'unknown';
    const userAgent = req ? req.headers.get('user-agent') : 'unknown';

    await ActivityLog.create({
      userId,
      action,
      details,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error('Activity Logging Failed:', error);
  }
};
