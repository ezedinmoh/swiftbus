interface OtpData {
  code: string;
  expiresAt: number;
  type: 'register' | 'reset';
}

// Global object to persist store across hot reloads in development
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpData>;
};

export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpData>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

export function generateOtp(email: string, type: 'register' | 'reset'): string {
  // Generate 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  
  // Set expiry (10 minutes from now)
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  otpStore.set(email.toLowerCase(), { code, expiresAt, type });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP STORE] Generated code for ${email} (Type: ${type})`);
  }
  return code;
}

export function verifyOtp(email: string, code: string, type: 'register' | 'reset'): boolean {
  const data = otpStore.get(email.toLowerCase());
  if (!data) return false;
  
  if (data.type !== type) return false;
  if (Date.now() > data.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  
  const isValid = data.code === code;
  if (isValid) {
    otpStore.delete(email.toLowerCase()); // Code used
  }
  
  return isValid;
}
