import dbConnect from "./dbConnect.js";
import MlmRateLimit from "../models/mlm/MlmRateLimit.js";

/**
 * Production-safe persistent rate limiter backed by MongoDB.
 * 
 * - Multi-instance / serverless safe.
 * - Explicitly checks expiresAt <= now to eliminate reliance on async TTL sweep latency.
 * - Atomically starts a new window when expired.
 * - Gracefully handles concurrent initial upsert race conditions (E11000 duplicate key).
 * 
 * @param {Object} params
 * @param {string} params.key - Unique rate-limit identifier (e.g. `mlm_pan_verify:${memberId}`)
 * @param {number} params.limit - Maximum number of allowed attempts
 * @param {number} params.windowSeconds - Window duration in seconds
 * @returns {Promise<{ allowed: boolean, count: number, limit: number, retryAfter: number, message: string }>}
 */
export async function checkRateLimit({ key, limit, windowSeconds }) {
  await dbConnect();

  const now = new Date();
  const windowMs = windowSeconds * 1000;
  const newExpiresAt = new Date(now.getTime() + windowMs);

  let record = null;

  // 1. Try atomic increment on an ACTIVE window (where expiresAt > now)
  record = await MlmRateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: 'after' }
  );

  // 2. If no active window exists (expired or first request), atomically reset/insert
  if (!record) {
    try {
      record = await MlmRateLimit.findOneAndUpdate(
        {
          key,
          $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }],
        },
        {
          $set: { count: 1, expiresAt: newExpiresAt },
        },
        { returnDocument: 'after', upsert: true }
      );
    } catch (err) {
      if (err.code === 11000) {
        // Race condition: another concurrent serverless execution just created the active record
        record = await MlmRateLimit.findOneAndUpdate(
          { key, expiresAt: { $gt: now } },
          { $inc: { count: 1 } },
          { returnDocument: 'after' }
        );
      } else {
        throw err;
      }
    }
  }

  // Fallback safeguard if record is still null for any reason
  if (!record) {
    record = await MlmRateLimit.findOne({ key });
  }

  const currentCount = record?.count ?? 1;
  const isAllowed = currentCount <= limit;
  const recordExpiry = record?.expiresAt ? new Date(record.expiresAt).getTime() : newExpiresAt.getTime();
  const retryAfter = Math.max(1, Math.ceil((recordExpiry - now.getTime()) / 1000));
  const retryMinutes = Math.ceil(retryAfter / 60);

  return {
    allowed: isAllowed,
    count: currentCount,
    limit,
    retryAfter,
    message: isAllowed
      ? "OK"
      : `Too many attempts. Rate limit exceeded (${limit} per ${Math.ceil(windowSeconds / 60)} minutes). Please try again in ${retryMinutes} minute(s).`,
  };
}
