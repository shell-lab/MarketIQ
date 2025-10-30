import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Expect ENCRYPTION_KEY as 64 hex chars (32 bytes). If not provided, set to null.
let ENCRYPTION_KEY = null;
if (process.env.ENCRYPTION_KEY) {
  try {
    const buf = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    if (buf.length === 32) ENCRYPTION_KEY = buf;
    else throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  } catch (err) {
    console.error('Invalid ENCRYPTION_KEY:', err.message);
    ENCRYPTION_KEY = null;
  }
}

const IV_LENGTH = 16;

function ensureKey() {
  if (!ENCRYPTION_KEY) throw new Error('Missing or invalid ENCRYPTION_KEY environment variable.');
}

export function encrypt(text) {
  ensureKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(hash) {
  try {
    ensureKey();
    const [ivHex, authTagHex, encryptedText] = hash.split(':');
    if (!ivHex || !authTagHex || !encryptedText) throw new Error('Invalid hash format');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}
