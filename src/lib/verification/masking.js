/**
 * Masking helpers for sensitive KYC data (PAN, Aadhaar).
 * Full PAN and Aadhaar must never appear in logs, normal responses, or audit events.
 */

export function maskPan(pan) {
  if (!pan || typeof pan !== 'string') return '';
  const clean = pan.trim().toUpperCase();
  if (clean.length !== 10) return 'XXXXXXXXXX';
  // Keep first 5 masked, middle 4 digits visible, last character masked: XXXXX1234X
  return `XXXXX${clean.slice(5, 9)}X`;
}

export function maskAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return '';
  const clean = aadhaar.trim().replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export function maskMobile(mobile) {
  if (!mobile || typeof mobile !== 'string') return '';
  const clean = mobile.trim().replace(/\D/g, '');
  if (clean.length < 4) return 'XXXXXX';
  return `XXXXXX${clean.slice(-4)}`;
}
