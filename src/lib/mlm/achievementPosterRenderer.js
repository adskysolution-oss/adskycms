import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

export async function generateQrDataUrl(text) {
  if (!text) return null;
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 260,
      color: {
        dark: '#030A1A',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.warn('QR Code generation failed:', err);
    return null;
  }
}

/**
 * Pre-fetches the member photo buffer with a timeout.
 */
async function resolveProfilePhotoBuffer(url) {
  if (!url) return null;
  if (url.startsWith('data:image/')) {
    const base64Data = url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch (err) {
      console.warn('[renderAchievementPoster] Profile photo fetch error:', err.message);
    }
  }
  return null;
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// In-memory template buffer cache to avoid re-downloading Cloudinary images on each render
const templateBufferCache = new Map();

async function resolveTemplateBuffer(templateUrl, fallbackLocalPath) {
  if (templateUrl && (templateUrl.startsWith('http://') || templateUrl.startsWith('https://'))) {
    if (templateBufferCache.has(templateUrl)) {
      return templateBufferCache.get(templateUrl);
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(templateUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        // Cache up to 30 templates in memory
        if (templateBufferCache.size > 30) {
          const firstKey = templateBufferCache.keys().next().value;
          templateBufferCache.delete(firstKey);
        }
        templateBufferCache.set(templateUrl, buf);
        return buf;
      }
    } catch (err) {
      console.warn('[renderAchievementPoster] Remote Cloudinary template fetch failed, trying local fallback:', err.message);
    }
  }

  if (fallbackLocalPath && fs.existsSync(fallbackLocalPath)) {
    return await fs.promises.readFile(fallbackLocalPath);
  }

  return null;
}

/**
 * Renders the fixed-template Level achievement poster using Cloudinary template or local public/l{level}.png.
 * 
 * Rules:
 * - Master templates are fetched from Cloudinary URL (with local public/l{level}.png fallback)
 * - Dynamic areas (Member Name, Member ID, Sponsor Code) are clean blank spaces in the master templates
 * - 1080 × 1350 px PNG output (4:5 ratio)
 * - Deterministic 400 × 400 center crop with circular mask for member photo
 * - Direct compositing of Member Name, Member ID, QR Code, and Sponsor Code with zero background patches
 */
export async function renderAchievementPoster({
  member,
  levelConfig,
  completedAt,
  includeReferralCode = true,
  includeReferralQr = true,
  referralUrl = '',
  templateUrl = '',
}) {
  const levelNum = levelConfig?.level || 1;
  const remoteUrl = templateUrl || levelConfig?.customBackgroundUrl || '';
  const templateFileName = `l${levelNum}.png`;
  const templatePath = path.join(process.cwd(), 'public', templateFileName);

  const rawTemplateBuf = await resolveTemplateBuffer(remoteUrl, templatePath);
  if (!rawTemplateBuf) {
    throw new Error(`Fixed poster template for Level ${levelNum} not found. Neither Cloudinary template nor local public/${templateFileName} is available.`);
  }

  // 1. Resize base template to exact 1080 × 1350
  const templateBuf = await sharp(rawTemplateBuf)
    .resize(1080, 1350)
    .png()
    .toBuffer();

  const compositeLayers = [];

  // 2. Member Profile Photo Replacement
  // Exact circle coordinates on 1080 × 1350 canvas:
  // Center: (x: 540, y: 460), diameter: 316px, radius: 158px, left: 382, top: 302
  const circleDiameter = 316;
  const circleRadius = circleDiameter / 2;
  const circleMask = Buffer.from(
    `<svg width="${circleDiameter}" height="${circleDiameter}"><circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius}" fill="#fff"/></svg>`
  );

  const rawPhotoBuf = await resolveProfilePhotoBuffer(member?.profileImage);
  if (rawPhotoBuf) {
    // 400x400 center crop (1:1 ratio), then resize to 316px circle mask
    const croppedCirclePhoto = await sharp(rawPhotoBuf)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .resize(circleDiameter, circleDiameter)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    compositeLayers.push({
      input: croppedCirclePhoto,
      top: 302,
      left: 382,
    });
  }

  // 3. Dynamic QR Code Replacement
  // White box area on 1080 × 1350 canvas: left: 66, top: 1160, width: 120, height: 120
  if (includeReferralQr && referralUrl) {
    const qrRawBuffer = await QRCode.toBuffer(referralUrl, {
      margin: 1,
      width: 260, // 260x260 high-res source
      color: { dark: '#030A1A', light: '#FFFFFF' },
    });
    const resizedQr = await sharp(qrRawBuffer)
      .resize(120, 120)
      .png()
      .toBuffer();

    compositeLayers.push({
      input: resizedQr,
      top: 1160,
      left: 66,
    });
  }

  // 4. Dynamic SVG Text Overlay directly onto blank template spaces (NO cover rects!)
  const memberName = (member?.fullName || 'NEXVIA MEMBER').toUpperCase();
  const memberId = member?.mlmCode || 'NEX-MEMBER';
  const sponsorCode = includeReferralCode ? (member?.mlmCode || '') : '';

  // Calculate safe font size for member name
  let nameFontSize = 32;
  if (memberName.length > 28) {
    nameFontSize = 22;
  } else if (memberName.length > 20) {
    nameFontSize = 26;
  } else if (memberName.length > 15) {
    nameFontSize = 29;
  }

  const svgOverlay = Buffer.from(`
    <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
      <!-- Member Name (Directly on blank space above golden divider) -->
      <text x="540" y="652" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="${nameFontSize}" font-weight="900" letter-spacing="2">${escapeXml(memberName)}</text>

      <!-- Member ID (Directly on blank space above NEXVIA MEMBER) -->
      <text x="540" y="688" text-anchor="middle" fill="#FEDB37" font-family="monospace" font-size="16" font-weight="900" letter-spacing="2">${escapeXml(memberId)}</text>

      <!-- Sponsor Referral Code (Directly after 'Sponsor: ') -->
      ${sponsorCode ? `
        <text x="278" y="1260" fill="#FEDB37" font-family="monospace" font-size="14" font-weight="900">${escapeXml(sponsorCode)}</text>
      ` : ''}
    </svg>
  `);

  compositeLayers.push({
    input: svgOverlay,
    top: 0,
    left: 0,
  });

  // 5. Produce final 1080 × 1350 PNG buffer
  const finalPosterBuffer = await sharp(templateBuf)
    .composite(compositeLayers)
    .png()
    .toBuffer();

  return {
    buffer: finalPosterBuffer,
    arrayBuffer: async () => finalPosterBuffer.buffer.slice(finalPosterBuffer.byteOffset, finalPosterBuffer.byteOffset + finalPosterBuffer.byteLength),
    width: 1080,
    height: 1350,
    contentType: 'image/png',
  };
}
