import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const createToken = async (payload) => {
  const cleanPayload = { ...payload };
  if (cleanPayload.id && typeof cleanPayload.id !== 'string') {
    cleanPayload.id = cleanPayload.id.toString();
  }
  if (cleanPayload._id && typeof cleanPayload._id !== 'string') {
    cleanPayload._id = cleanPayload._id.toString();
  }
  return await new SignJWT(cleanPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload) {
      const normalizeId = (raw) => {
        if (!raw) return raw;
        if (typeof raw === 'string') return raw;
        if (typeof raw === 'object') {
          if (raw.buffer) {
            try {
              const buf = Buffer.from(Object.values(raw.buffer));
              if (buf.length === 12) return buf.toString('hex');
            } catch (e) {}
          }
          if (typeof raw.toString === 'function') {
            const str = raw.toString();
            if (str !== '[object Object]') return str;
          }
        }
        return raw;
      };
      if (payload.id) payload.id = normalizeId(payload.id);
      if (payload._id) payload._id = normalizeId(payload._id);
      if (payload.userId) payload.userId = normalizeId(payload.userId);
      if (!payload.id && (payload._id || payload.userId)) {
        payload.id = payload._id || payload.userId;
      }
      if (payload.name && !payload.fullName) payload.fullName = payload.name;
      if (payload.fullName && !payload.name) payload.name = payload.fullName;
    }
    return payload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = async (token) => {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
};

export const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

export const getAuthUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await verifyToken(token);
};

export const authenticateRequest = async (request) => {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    // Parse cookies from header
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
    
    const token = cookies.token;
    if (!token) return null;
    
    return await verifyToken(token);
  } catch (error) {
    console.error('Error authenticating request:', error);
    return null;
  }
};

export const getAuthSession = async () => {
  return await getAuthUser();
};
