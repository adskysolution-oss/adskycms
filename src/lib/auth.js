import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const createToken = async (payload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret);
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
