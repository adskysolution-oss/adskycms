import toast from 'react-hot-toast';

/**
 * Strips raw media/storage URLs (such as Cloudinary or proxy links) from marketing text,
 * while preserving legitimate member referral links, website links, and CTAs.
 */
export function stripMediaUrls(text = '') {
  if (!text) return '';

  let cleaned = text
    // Remove "🖼️ Official Campaign Poster:\nhttps://..." or "Poster:\nhttps://..." labels followed by media URLs
    .replace(/(?:🖼️\s*)?(?:official\s+)?(?:campaign\s+)?poster(?:\s+link|\s+image)?:\s*\n?\s*https?:\/\/[^\s]+/gi, '')
    // Remove Cloudinary URLs (res.cloudinary.com or any *.cloudinary.com)
    .replace(/https?:\/\/(?:[a-zA-Z0-9-]+\.)*cloudinary\.com\/[^\s]+/gi, '')
    // Remove internal media proxy URLs if present
    .replace(/(?:https?:\/\/[^\s]+)?\/api\/mlm\/proxy-media\?[^\s]+/gi, '')
    // Remove any trailing S3 raw URLs if present
    .replace(/https?:\/\/[a-zA-Z0-9.-]+\.s3[a-zA-Z0-9.-]*\.amazonaws\.com\/[^\s]+/gi, '');

  // Normalize excessive blank lines left behind after stripping URLs
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

/**
 * Sanitizes a title string into a safe file name.
 */
export function sanitizeFileName(rawTitle, extension = 'jpg') {
  const base = (rawTitle || 'nexvia-poster')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'poster';

  const cleanExt = (extension || 'jpg').replace(/^\./, '').toLowerCase();
  return `${base}.${cleanExt}`;
}

/**
 * Fetches a media file as a native File object.
 * Attempts direct browser fetch first; on CORS or network failure,
 * falls back to the secure /api/mlm/proxy-media route.
 */
export async function fetchMediaFile(url, preferredFileName, fallbackTitle = 'poster') {
  if (!url) return null;

  let blob = null;

  // 1. Attempt direct browser fetch
  try {
    const directRes = await fetch(url, {
      mode: 'cors',
      headers: {
        Accept: 'image/*, video/*, application/pdf, */*',
      },
    });
    if (directRes.ok) {
      blob = await directRes.blob();
    }
  } catch (err) {
    console.debug('[fetchMediaFile] Direct fetch failed or blocked by CORS, trying proxy:', err);
  }

  // 2. Fallback to SSRF-protected server proxy
  if (!blob) {
    try {
      const proxyUrl = `/api/mlm/proxy-media?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        blob = await proxyRes.blob();
      } else {
        console.warn(`[fetchMediaFile] Proxy returned status ${proxyRes.status}`);
      }
    } catch (err) {
      console.warn('[fetchMediaFile] Proxy fetch error:', err);
    }
  }

  if (!blob) {
    return null;
  }

  // Validate MIME type
  const rawType = blob.type || 'image/jpeg';
  const cleanType = rawType.split(';')[0].trim().toLowerCase();

  // Determine file extension
  let ext = 'jpg';
  if (cleanType.includes('png')) ext = 'png';
  else if (cleanType.includes('webp')) ext = 'webp';
  else if (cleanType.includes('gif')) ext = 'gif';
  else if (cleanType.includes('svg')) ext = 'svg';
  else if (cleanType.includes('mp4')) ext = 'mp4';
  else if (cleanType.includes('pdf')) ext = 'pdf';

  const fileName = preferredFileName
    ? preferredFileName.trim()
    : sanitizeFileName(fallbackTitle, ext);

  try {
    return new File([blob], fileName, { type: cleanType });
  } catch {
    // In rare environments where File constructor is restricted, augment Blob
    blob.name = fileName;
    blob.lastModified = Date.now();
    return blob;
  }
}

/**
 * Converts any image blob (JPEG, WebP, etc.) to PNG format using HTMLCanvasElement,
 * because the ClipboardItem API in Chromium/Edge primarily supports 'image/png'.
 */
async function convertBlobToPng(blob) {
  if (!blob) return null;
  if (blob.type === 'image/png') return blob;

  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return resolve(null);
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);

        canvas.toBlob((pngBlob) => {
          resolve(pngBlob || null);
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        console.debug('[convertBlobToPng] Canvas draw failed:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}

/**
 * Attempts to copy an image directly into the system clipboard.
 * Gracefully catches errors if clipboard permission is denied or unsupported.
 */
export async function copyImageToClipboard(blobOrFile) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (!navigator.clipboard || typeof navigator.clipboard.write !== 'function') return false;
  if (typeof ClipboardItem === 'undefined') return false;

  try {
    // ClipboardItem in desktop Chrome/Edge strictly requires 'image/png'
    const pngBlob = await convertBlobToPng(blobOrFile);
    if (!pngBlob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob,
      }),
    ]);
    return true;
  } catch (err) {
    console.debug('[copyImageToClipboard] Clipboard write failed or permission denied:', err);
    return false;
  }
}

/**
 * Reliably triggers a client-side file download via an invisible <a> link.
 */
export function downloadBlob(blobOrFile, fileName = 'poster.jpg') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blobUrl = window.URL.createObjectURL(blobOrFile);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL after a brief delay
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Centralized direct poster sharing handler.
 * 
 * Flow:
 * 1. Resolves clean personalized text (removes any raw Cloudinary/media URLs).
 * 2. Mobile / Supported Browsers:
 *    Fetches poster file and shares directly via Web Share API Level 2:
 *    navigator.share({ files: [file], text: cleanText, title })
 *    WhatsApp receives the actual poster image with clean caption.
 * 3. Desktop / Unsupported Browsers Fallback:
 *    - Automatically downloads the poster file.
 *    - Attempts to copy image to clipboard for quick Ctrl+V pasting.
 *    - Opens WhatsApp Web with clean text (NO Cloudinary URL).
 *    - Displays informative toast instructions.
 */
export async function sharePosterDirectly({
  item,
  text = '',
  title = '',
  member = null,
  onAnalytics = null,
}) {
  const targetUrl = item?.fileUrl || item?.imageUrl || item?.url;
  const isMediaAsset = !!targetUrl;

  // Personalize referral tags if provided
  let personalized = text || item?.shareText || item?.caption || item?.title || '';
  if (member) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.adskysolution.com';
    const memberCode = member?.mlmCode || '';
    const inviteLink = `${origin}/nextview/register?sponsor=${memberCode}`;
    const memberName = member?.fullName || 'NextView Community Member';

    personalized = personalized
      .replace(/\{\{REFERRAL_LINK\}\}/g, inviteLink)
      .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, memberCode ? `*${memberCode}*` : '')
      .replace(/\{\{MEMBER_NAME\}\}/g, memberName);
  }

  // Remove any raw Cloudinary or media URLs from share text
  const cleanCaption = stripMediaUrls(personalized);
  const shareTitle = title || item?.title || 'NextView Marketing Poster';

  // ── CASE 1: Text-only marketing creative (no image/poster file) ──
  if (!isMediaAsset) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: cleanCaption,
        });
        if (onAnalytics) onAnalytics('share');
        toast.success('Shared successfully!');
        return { success: true, mode: 'text_native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, cancelled: true };
        }
      }
    }
    // WhatsApp text fallback
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(cleanCaption)}`, '_blank');
    if (onAnalytics) onAnalytics('share');
    toast.success('Opening WhatsApp...');
    return { success: true, mode: 'text_whatsapp' };
  }

  // ── CASE 2: Image / Poster Creative ──
  const toastId = 'poster-share-toast';
  toast.loading('Preparing poster...', { id: toastId });

  const fileName = item?.fileName || sanitizeFileName(shareTitle, 'jpg');
  const file = await fetchMediaFile(targetUrl, fileName, shareTitle);

  // 1. Mobile & Web Share API with Files
  if (file && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    let canShareFile = false;
    try {
      if (typeof navigator.canShare === 'function') {
        canShareFile = navigator.canShare({ files: [file] });
      }
    } catch {
      canShareFile = false;
    }

    if (canShareFile) {
      try {
        toast.dismiss(toastId);
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: cleanCaption, // NO Cloudinary URL in text!
        });
        if (onAnalytics) onAnalytics('share');
        toast.success('Poster shared successfully!');
        return { success: true, mode: 'native_file_share' };
      } catch (err) {
        if (err.name === 'AbortError') {
          // User closed the share sheet without selecting an app
          return { success: false, cancelled: true };
        }
        console.warn('[sharePosterDirectly] Native share failed, using desktop fallback:', err);
      }
    }
  }

  // 2. Desktop / Unsupported Browser Fallback
  toast.dismiss(toastId);

  let imageCopied = false;
  if (file) {
    // Attempt clipboard image copy
    imageCopied = await copyImageToClipboard(file);

    // Trigger poster file download
    downloadBlob(file, fileName);
  } else {
    // Fallback direct browser download if file fetch completely failed
    try {
      const directA = document.createElement('a');
      directA.href = targetUrl;
      directA.download = fileName;
      directA.target = '_blank';
      directA.rel = 'noopener noreferrer';
      document.body.appendChild(directA);
      directA.click();
      document.body.removeChild(directA);
    } catch {
      // Ignored
    }
  }

  // Open WhatsApp Web with clean text (NO Cloudinary URL, NO proxy URL)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanCaption)}`;
  window.open(whatsappUrl, '_blank');

  if (onAnalytics) onAnalytics('share');

  if (imageCopied) {
    toast.success('Poster downloaded & copied! Paste (Ctrl+V) directly into WhatsApp chat.', {
      duration: 6000,
    });
  } else {
    toast.success("Poster downloaded. If WhatsApp doesn't attach it automatically, attach the downloaded poster.", {
      duration: 6000,
    });
  }

  return { success: true, mode: 'desktop_fallback', imageCopied };
}
