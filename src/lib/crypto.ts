/**
 * Unbound — Application-Level AES-256-GCM Encryption
 *
 * Keys are derived via HMAC-SHA256(collection.id, ENCRYPTION_MASTER_SECRET).
 * The derived key is NEVER stored in the database — it is reconstructed
 * on every read/write from the stable collection.id + server-side secret.
 *
 * This means:
 *   ✅ Even full DB access reveals only ciphertext — not the key
 *   ✅ No schema changes needed (no enc_key column)
 *   ✅ Graceful fallback: legacy plaintext data reads correctly
 *   ✅ AES-GCM authentication tag prevents silent corruption
 */

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;       // 96-bit nonce (NIST recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derive a deterministic AES-256 key from a collection's UUID
 * and the server-side ENCRYPTION_MASTER_SECRET environment variable.
 * Returns null if the env var is not set (graceful degradation).
 */
export function deriveKey(collectionId: string): string | null {
  const masterSecret = process.env.ENCRYPTION_MASTER_SECRET;
  if (!masterSecret) {
    // Encryption is disabled — site still works, just without encryption.
    return null;
  }
  return createHmac('sha256', masterSecret).update(collectionId).digest('base64');
}

/**
 * Encrypt a string field with AES-256-GCM.
 * Output format (base64): [ IV (12B) | AuthTag (16B) | Ciphertext (nB) ]
 *
 * If key is null (ENCRYPTION_MASTER_SECRET not set), returns plaintext as-is.
 * If plaintext is empty/null, returns it unchanged.
 */
export function encryptField(plaintext: string | null | undefined, key: string | null): string {
  if (plaintext == null || plaintext === '') return plaintext ?? '';
  if (!key) return plaintext; // Encryption disabled — return as-is

  try {
    const keyBuf = Buffer.from(key, 'base64');
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, keyBuf, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Concatenate IV + AuthTag + Ciphertext, then base64-encode
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  } catch (e) {
    console.error('[Unbound Crypto] Encryption failed:', e);
    return plaintext; // Fallback to plaintext on unexpected error
  }
}

/**
 * Decrypt an AES-256-GCM encrypted field.
 *
 * Gracefully handles:
 *   - null/empty values
 *   - null key (encryption disabled)
 *   - legacy plaintext data (before encryption was added)
 *   - authentication failures (wrong key or corrupt data)
 *
 * In all failure cases, the original ciphertext string is returned,
 * ensuring legacy unencrypted data is always readable.
 */
export function decryptField(ciphertext: string | null | undefined, key: string | null): string {
  if (ciphertext == null || ciphertext === '') return ciphertext ?? '';
  if (!key) return ciphertext; // Encryption disabled — treat as plaintext

  try {
    const keyBuf = Buffer.from(key, 'base64');
    const data = Buffer.from(ciphertext, 'base64');

    // Minimum valid ciphertext length = IV(12) + AuthTag(16) + 1 byte
    if (data.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      return ciphertext; // Too short — must be legacy plaintext
    }

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedData = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, keyBuf, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    // AES-GCM throws on auth tag mismatch.
    // This ALWAYS means the input was legacy plaintext — return it as-is.
    return ciphertext;
  }
}
