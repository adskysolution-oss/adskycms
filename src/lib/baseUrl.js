/**
 * Resolves a trusted base URL for Cashfree payment redirects and webhook notifications.
 * Never allows localhost/127.0.0.1 in production environments.
 */
export function getTrustedBaseUrl() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.CASHFREE_ENV === 'production';

  const configured =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';

  const isLocalhost =
    !configured ||
    configured.includes('localhost') ||
    configured.includes('127.0.0.1') ||
    configured.includes('0.0.0.0');

  if (isProduction && isLocalhost) {
    return 'https://www.adskysolution.com';
  }

  if (configured && !isLocalhost) {
    return configured.replace(/\/+$/, '').replace(/^http:\/\//i, 'https://');
  }

  // Development/sandbox fallback
  return configured
    ? configured.replace(/\/+$/, '')
    : 'http://localhost:3000';
}
