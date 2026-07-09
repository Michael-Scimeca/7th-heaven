import crypto from 'crypto';

// Retrieve the encryption key from environment, or use a secure fallback for development
const ENCRYPTION_SECRET = process.env.CRUISE_ENCRYPTION_KEY || 'default-7thheaven-secret-key-32-chars-long!';

// Derive a 32-byte (256-bit) key from the secret string to ensure proper AES key length
const KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

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
