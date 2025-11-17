import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for a token
 * @param token - The subscription UUID to sign
 * @returns The hex-encoded signature
 */
export function signToken(token: string): string {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error('HMAC_SECRET environment variable is not set');
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(token);
  return hmac.digest('hex');
}

/**
 * Verify HMAC-SHA256 signature for a token
 * @param token - The subscription UUID
 * @param signature - The signature to verify
 * @returns True if signature is valid, false otherwise
 */
export function verifyToken(token: string, signature: string): boolean {
  try {
    const expectedSignature = signToken(token);
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

/**
 * Generate a complete unsubscribe URL with token and signature
 * @param subscriptionId - The subscription UUID
 * @param domain - The domain to use (e.g., 'hardstyleevents.com')
 * @returns Object with API URL and page URL
 */
export function generateUnsubscribeUrls(subscriptionId: string, domain: string): {
  apiUrl: string;
  pageUrl: string;
} {
  const signature = signToken(subscriptionId);
  
  return {
    apiUrl: `https://${domain}/api/unsubscribe/${subscriptionId}.${signature}`,
    pageUrl: `https://${domain}/unsubscribe?token=${subscriptionId}&sig=${signature}`
  };
}


