import fs from 'fs';
import path from 'path';

export interface VerificationPin {
  email: string;
  pin: string;
  expiresAt: number;
}

const PINS_FILE_PATH = path.resolve(process.cwd(), 'data/verification_pins.json');

// Ensure the directory and file exist
function initStore() {
  const dir = path.dirname(PINS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(PINS_FILE_PATH)) {
    fs.writeFileSync(PINS_FILE_PATH, '[]', 'utf8');
  }
}

export function savePin(email: string, pin: string, ttlMs: number = 10 * 60 * 1000): void {
  initStore();
  const pins: VerificationPin[] = JSON.parse(fs.readFileSync(PINS_FILE_PATH, 'utf8') || '[]');
  const cleanEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + ttlMs;

  // Remove any existing pin for this email
  const updatedPins = pins.filter(p => p.email !== cleanEmail);
  updatedPins.push({ email: cleanEmail, pin, expiresAt });

  fs.writeFileSync(PINS_FILE_PATH, JSON.stringify(updatedPins, null, 2), 'utf8');
}

export function verifyPin(email: string, pin: string): boolean {
  initStore();
  const pins: VerificationPin[] = JSON.parse(fs.readFileSync(PINS_FILE_PATH, 'utf8') || '[]');
  const cleanEmail = email.toLowerCase().trim();
  const foundIndex = pins.findIndex(p => p.email === cleanEmail && p.pin === pin);

  if (foundIndex === -1) return false;

  const found = pins[foundIndex];
  // Check expiration
  if (Date.now() > found.expiresAt) {
    // Remove expired pin
    pins.splice(foundIndex, 1);
    fs.writeFileSync(PINS_FILE_PATH, JSON.stringify(pins, null, 2), 'utf8');
    return false;
  }

  // Remove used pin
  pins.splice(foundIndex, 1);
  fs.writeFileSync(PINS_FILE_PATH, JSON.stringify(pins, null, 2), 'utf8');
  return true;
}
