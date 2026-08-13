import QRCode from 'qrcode';

// Default Admin TOTP secret (Base32 format, compatible with Google Authenticator)
export const DEFAULT_ADMIN_2FA_SECRET = 'JBSWY3DPEHPK3PXP';

/**
 * Helper: Base32 Decode to Uint8Array
 */
const base32Decode = (base32: string): Uint8Array => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
};

/**
 * Generates an RFC 6238 6-digit TOTP token for a given timestamp and Base32 secret using Web Crypto API
 */
export const generateSyncTOTP = async (secret: string, timestamp: number = Date.now()): Promise<string> => {
  try {
    const keyBytes = base32Decode(secret);
    const timeStep = Math.floor(timestamp / 1000 / 30);
    
    // Convert timeStep to 8-byte big-endian Uint8Array
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, timeStep, false);

    // SubtleCrypto HMAC-SHA1
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
    const hmac = new Uint8Array(signature);

    // Dynamic Truncation
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('Error generating TOTP token:', err);
    return '';
  }
};

/**
 * Retrieves the configured Admin 2FA Secret from environment variables or custom saved setup secret.
 */
export const getAdmin2FASecret = (): string => {
  const metaEnv = (import.meta as any).env;
  const envSecret = process.env.ADMIN_2FA_SECRET ||
    process.env.VITE_ADMIN_2FA_SECRET ||
    (metaEnv && metaEnv.VITE_ADMIN_2FA_SECRET);

  if (envSecret && envSecret.trim()) {
    return envSecret.trim().toUpperCase();
  }

  const savedSetupSecret = localStorage.getItem('getacoach_admin_totp_secret');
  if (savedSetupSecret) {
    return savedSetupSecret.trim().toUpperCase();
  }

  return DEFAULT_ADMIN_2FA_SECRET;
};

/**
 * Saves a new custom Base32 setup secret to localStorage for Admin 2FA
 */
export const saveAdmin2FASecret = (secret: string) => {
  localStorage.setItem('getacoach_admin_totp_secret', secret.trim().toUpperCase());
};

/**
 * Generates a random 16-character Base32 secret for setup
 */
export const generateNewTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

/**
 * Builds the otpauth:// URI for Google Authenticator app scanning
 */
export const getOTPAuthURI = (secret: string, accountName: string = 'admin@getacoach.ch'): string => {
  const label = encodeURIComponent(`GET A COACH:${accountName}`);
  const issuer = encodeURIComponent('GET A COACH.ch');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
};

/**
 * Generates a QR Code Data URL (base64 image) from the otpauth URI
 */
export const generateQRCodeDataURL = async (secret: string, accountName: string = 'admin@getacoach.ch'): Promise<string> => {
  const otpauthUrl = getOTPAuthURI(secret, accountName);
  return await QRCode.toDataURL(otpauthUrl, {
    width: 240,
    margin: 2,
    color: {
      dark: '#1A265A',
      light: '#FFFFFF'
    }
  });
};

/**
 * Asynchronously verifies a 6-digit TOTP token against secret with ±1 time step window tolerance
 */
export const verifyTOTPTokenAsync = async (token: string, secret?: string): Promise<boolean> => {
  if (!token || token.trim().length !== 6 || !/^\d{6}$/.test(token.trim())) {
    return false;
  }

  const cleanToken = token.trim();
  const targetSecret = secret || getAdmin2FASecret();
  const now = Date.now();

  // Test current window, -30s window, and +30s window for clock drift
  const timestamps = [now, now - 30000, now + 30000];

  for (const ts of timestamps) {
    const expected = await generateSyncTOTP(targetSecret, ts);
    if (expected && expected === cleanToken) {
      return true;
    }
  }

  return false;
};
