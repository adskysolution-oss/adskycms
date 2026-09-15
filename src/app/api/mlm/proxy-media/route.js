import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Allowed trusted hostnames for media storage
const ALLOWED_HOSTS = new Set([
  'res.cloudinary.com',
  'cloudinary.com',
  'adskysolution.com',
  'www.adskysolution.com',
]);

// Allowed MIME types for media streaming
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

// Maximum allowed payload size in bytes (35MB)
const MAX_MEDIA_BYTES = 35 * 1024 * 1024;

/**
 * Checks if a hostname or IP is an SSRF risk:
 * - localhost, loopback, private networks, cloud metadata services
 */
function isDisallowedHost(hostname) {
  const lower = (hostname || '').toLowerCase().trim();

  // Localhost and loopback
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower === '[::1]' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }

  // Cloud metadata services (e.g. AWS/GCP 169.254.169.254)
  if (lower.startsWith('169.254.')) {
    return true;
  }

  // Check IPv4 private address ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);

    // 10.0.0.0/8
    if (oct1 === 10) return true;
    // 172.16.0.0/12
    if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return true;
    // 192.168.0.0/16
    if (oct1 === 192 && oct2 === 168) return true;
    // 127.0.0.0/8 (Loopback)
    if (oct1 === 127) return true;
    // 0.0.0.0/8
    if (oct1 === 0) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (oct1 === 100 && oct2 >= 64 && oct2 <= 127) return true;
  }

  return false;
}

/**
 * Validates whether the given URL is a safe, allowed media endpoint.
 */
function validateMediaUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);

    // Only HTTPS allowed
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Only https:// protocol is supported' };
    }

    const host = parsed.hostname.toLowerCase();

    // Reject dangerous/private hosts
    if (isDisallowedHost(host)) {
      return { valid: false, reason: 'Target host is not permitted' };
    }

    // Check against allowed domains
    const isCloudinaryDomain = host === 'res.cloudinary.com' || host.endsWith('.cloudinary.com');
    const isAllowedCustom = ALLOWED_HOSTS.has(host);
    const isS3Domain = host.endsWith('.amazonaws.com');

    if (!isCloudinaryDomain && !isAllowedCustom && !isS3Domain) {
      return { valid: false, reason: 'Domain not in trusted media allowlist' };
    }

    return { valid: true, parsedUrl: parsed.toString() };
  } catch {
    return { valid: false, reason: 'Malformed URL' };
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');

    if (!mediaUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing "url" parameter.' },
        { status: 400 }
      );
    }

    const validation = validateMediaUrl(mediaUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.reason },
        { status: 403 }
      );
    }

    // Fetch upstream media with timeout and redirect validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let upstreamRes;
    try {
      upstreamRes = await fetch(validation.parsedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AdskyCMS-MediaProxy/1.0',
          Accept: 'image/*, video/*, application/pdf, */*',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream media server returned status ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    // Validate Content-Type
    const rawContentType = upstreamRes.headers.get('content-type') || '';
    const cleanContentType = rawContentType.split(';')[0].trim().toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(cleanContentType)) {
      return NextResponse.json(
        { success: false, message: `Unsupported media type: ${cleanContentType}` },
        { status: 415 }
      );
    }

    // Validate Content-Length if present
    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_MEDIA_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Media file exceeds maximum allowed proxy size of 35MB.' },
        { status: 413 }
      );
    }

    // Return binary buffer
    const arrayBuffer = await upstreamRes.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_MEDIA_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Media file exceeds maximum allowed proxy size of 35MB.' },
        { status: 413 }
      );
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': cleanContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { success: false, message: 'Media fetch timed out.' },
        { status: 504 }
      );
    }
    console.error('[MLM Media Proxy Error]:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to proxy media asset.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
