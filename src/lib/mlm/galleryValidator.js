/**
 * Server-side validation and security utilities for NextView Gallery / Marketing Library.
 */

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mpeg',
  'video/x-matroska',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

const DISALLOWED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'ts', 'jsx', 'tsx',
  'py', 'pl', 'cgi', 'jar', 'vbs', 'scr', 'msi', 'dll', 'com'
]);

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_DOC_SIZE_BYTES = 25 * 1024 * 1024;   // 25MB
const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024; // 60MB

/**
 * Validates an uploaded marketing file
 * @param {File|Blob} file 
 * @returns {{ valid: boolean, error?: string, fileType?: string }}
 */
export function validateMarketingFile(file) {
  if (!file || typeof file !== 'object') {
    return { valid: false, error: 'No file provided.' };
  }

  const name = (file.name || '').toLowerCase();
  const ext = name.split('.').pop() || '';

  if (DISALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type .${ext} is strictly prohibited for security.` };
  }

  const mimeType = (file.type || '').toLowerCase();
  if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: `Unsupported media type: ${mimeType}. Please upload images, videos, or standard documents.` };
  }

  const size = file.size || 0;
  if (mimeType.startsWith('video/')) {
    if (size > MAX_VIDEO_SIZE_BYTES) {
      return { valid: false, error: `Video size exceeds maximum allowed limit of 60MB.` };
    }
    return { valid: true, fileType: 'VIDEO' };
  }

  if (mimeType.startsWith('image/')) {
    if (size > MAX_IMAGE_SIZE_BYTES) {
      return { valid: false, error: `Image size exceeds maximum allowed limit of 15MB.` };
    }
    return { valid: true, fileType: 'IMAGE' };
  }

  if (size > MAX_DOC_SIZE_BYTES) {
    return { valid: false, error: `Document size exceeds maximum allowed limit of 25MB.` };
  }

  return { valid: true, fileType: 'DOCUMENT' };
}

/**
 * Safely escapes special regex characters in user search inputs to prevent ReDoS / injection
 */
export function escapeRegex(text = '') {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
