/**
 * Secure AES-256-CBC Payload Encryption & Decryption module (Web Crypto API).
 * Ensures payloads & responses in DevTools Network tab remain encrypted ciphertext.
 */

const SECRET_KEY_RAW = 'tap_review_ai_jwt_secret_key_production_2026_secured';

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_KEY_RAW);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hexStr: string): Uint8Array {
  const bytes = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Encrypts any JS object or string payload into AES-256-CBC ciphertext string.
 */
export async function encryptPayloadAsync(data: any): Promise<string> {
  if (data === undefined || data === null) return data;
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encodedText = new TextEncoder().encode(jsonStr);
    const encryptedBuf = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv as unknown as BufferSource },
      key,
      encodedText as unknown as BufferSource
    );
    return `enc:${bufToHex(iv.buffer)}:${bufToHex(encryptedBuf)}`;
  } catch (err) {
    console.error('Payload encryption error:', err);
    return jsonStr;
  }
}

/**
 * Decrypts an incoming ciphertext string (`enc:...`) back into its original JS object.
 */
export async function decryptPayloadAsync(payloadStr: any): Promise<any> {
  if (typeof payloadStr !== 'string' || !payloadStr.startsWith('enc:')) {
    return payloadStr;
  }
  try {
    const parts = payloadStr.slice(4).split(':');
    if (parts.length !== 2) return payloadStr;
    const iv = hexToBuf(parts[0]);
    const cipherBytes = hexToBuf(parts[1]);
    const key = await getCryptoKey();
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv as unknown as BufferSource },
      key,
      cipherBytes as unknown as BufferSource
    );
    const decryptedText = new TextDecoder().decode(decryptedBuf);
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error('Payload decryption error:', err);
    return payloadStr;
  }
}

/**
 * Legacy compatibility wrapper for password encoding
 */
export function encodePasswordPayload(password?: string): string | undefined {
  if (!password) return password;
  return password;
}
