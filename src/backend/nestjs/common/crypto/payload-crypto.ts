import crypto from 'crypto';

const SECRET_KEY_RAW = process.env.JWT_SECRET || 'tap_review_ai_jwt_secret_key_production_2026_secured';
const KEY = crypto.createHash('sha256').update(SECRET_KEY_RAW).digest(); // 32 bytes

/**
 * Encrypts any data payload into a secure ciphertext string.
 * Formatted as `enc:<16_byte_iv_hex>:<ciphertext_hex>`
 */
export function encryptPayload(data: any): string {
  if (data === undefined || data === null) return data;
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `enc:${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an incoming encrypted ciphertext string back to the original object or primitive.
 */
export function decryptPayload(payloadStr: any): any {
  if (typeof payloadStr !== 'string' || !payloadStr.startsWith('enc:')) {
    return payloadStr; // Return as-is if plain JSON or already decrypted
  }
  try {
    const parts = payloadStr.slice(4).split(':');
    if (parts.length !== 2) return payloadStr;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('⚠️ Backend Payload Decryption Error:', err);
    return payloadStr;
  }
}
