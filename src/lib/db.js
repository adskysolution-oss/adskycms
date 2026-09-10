import mongoose from 'mongoose';

let rawUri = (process.env.MONGODB_URI || '').trim();
if (rawUri.startsWith('MONGODB_URI=')) {
  rawUri = rawUri.replace(/^MONGODB_URI=/, '').trim();
}
const MONGODB_URI = rawUri;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
