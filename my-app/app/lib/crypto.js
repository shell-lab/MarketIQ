import crypto from 'crypto';

// Get these from environment variables. DO NOT hardcode them.
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'default_key_32_bytes_1234567890', 'hex'); // Must be 32 bytes (64 hex chars)
const IV_LENGTH = 16; // For AES-GCM

// This file is ONLY for the server-side (Next.js API routes).
// DO NOT expose these functions or the key to the client.

export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Store iv, authTag, and encrypted data together
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(hash) {
    try {
        const [ivHex, authTagHex, encryptedText] = hash.split(':');
        if (!ivHex || !authTagHex || !encryptedText) {
            throw new Error('Invalid hash format');
        }

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
