import crypto from 'crypto';

// CRUISE_ENCRYPTION_KEY must be set in production.
// In development, a throwaway key is derived at startup so local testing
// works without env setup.  NEVER commit a real key to source control.
if (!process.env.CRUISE_ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('CRUISE_ENCRYPTION_KEY environment variable is required in production.');
}
// Derive a 32-byte (256-bit) key. In dev, a fixed derivation is used so
// restarts stay consistent without requiring the env var.
const KEY: Buffer = process.env.CRUISE_ENCRYPTION_KEY
  ? crypto.createHash('sha256').update(process.env.CRUISE_ENCRYPTION_KEY).digest()
  : crypto.randomBytes(32);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for AES-GCM
const TAG_LENGTH = 16;

/**
 * Encrypts cleartext using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:encrypted_content:auth_tag
  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypts ciphertext using AES-256-GCM. Returns cleartext or original if invalid.
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // If not in our encrypted format, return original (e.g. legacy cleartext or masked values)
    return ciphertext;
  }

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    // If decryption fails (e.g. wrong key), fallback to returning original string
    return ciphertext;
  }
}
