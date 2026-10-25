import { AuthUser, AuthSession } from '../types/auth.js';

const USERS_STORAGE_KEY = 'tfs_registered_users_v1';
const SESSION_STORAGE_KEY = 'tfs_auth_session_v1';
const PENDING_OTP_KEY = 'tfs_pending_otp_verification';

/**
 * Demo Password Hashing Simulation
 * NOTE FOR PRODUCTION: In production with Supabase / Firebase / Node backend,
 * this will use argon2 / bcrypt with salt.
 */
export function hashPassword(plain: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(`TFS_SALT_${plain}_SECURE`);
  }
  return plain;
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

const TFS_USERS_KEY = 'tfs_users';

/**
 * Seed initial registered demo accounts if storage is empty
 */
export function getRegisteredUsers(): AuthUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TFS_USERS_KEY) || localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const defaultUsers: AuthUser[] = [
        {
          id: 'user_tfs_demo',
          name: 'মাসুম বিল্লাহ',
          email: 'masumbillahmmn2314@gmail.com',
          passwordHash: hashPassword('password123'),
          studentClass: '10',
          school: 'রাজউক উত্তরা মডেল কলেজ',
          district: 'ঢাকা',
          isVerified: true,
          createdAt: new Date().toISOString(),
          totalXP: 140,
          level: 2,
          totalExams: 2,
          totalCorrect: 16,
          totalAttempted: 20,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
        }
      ];
      localStorage.setItem(TFS_USERS_KEY, JSON.stringify(defaultUsers));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading users:', e);
    return [];
  }
}

export function saveRegisteredUsers(users: AuthUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(users);
    localStorage.setItem(TFS_USERS_KEY, serialized);
    localStorage.setItem(USERS_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Error saving registered users:', e);
  }
}

export function updateUserExamStats(
  identifier: string,
  stats: {
    totalXP: number;
    level: number;
    totalExams: number;
    totalCorrect: number;
    totalAttempted: number;
    school?: string;
    avatar?: string;
  }
): void {
  const users = getRegisteredUsers();
  const normalized = identifier.trim().toLowerCase();
  let updated = false;

  const newUsers = users.map((u) => {
    if (u.id === identifier || u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized) {
      updated = true;
      return {
        ...u,
        totalXP: stats.totalXP,
        level: stats.level,
        totalExams: stats.totalExams,
        totalCorrect: stats.totalCorrect,
        totalAttempted: stats.totalAttempted,
        school: stats.school || u.school,
        avatar: stats.avatar || u.avatar
      };
    }
    return u;
  });

  if (updated) {
    saveRegisteredUsers(newUsers);
  }
}

/**
 * Generate 6-digit random OTP
 */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Register a new user
 */
export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  studentClass: '9' | '10';
  school?: string;
}): { success: boolean; message: string; otp?: string; email?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Basic email validation
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return { success: false, message: 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।' };
  }

  // Check existing user
  const existing = users.find((u) => u.email === normalizedEmail);
  if (existing && existing.isVerified) {
    return { success: false, message: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। লগইন করুন।' };
  }

  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const newUser: AuthUser = {
    id: existing ? existing.id : `usr_${Date.now()}`,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(data.password),
    studentClass: data.studentClass,
    school: data.school?.trim(),
    district: 'ঢাকা',
    isVerified: false,
    otpCode: otp,
    otpExpiresAt,
    createdAt: new Date().toISOString(),
    totalXP: 0,
    level: 1,
    totalExams: 0,
    totalCorrect: 0,
    totalAttempted: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  };

  // If unverified exists, replace; else push
  const updatedUsers = existing
    ? users.map((u) => (u.email === normalizedEmail ? newUser : u))
    : [...users, newUser];

  saveRegisteredUsers(updatedUsers);

  // Store pending email for OTP verification page
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({ email: normalizedEmail, purpose: 'register', otp, expiresAt: otpExpiresAt })
    );
  }

  // Console log OTP for developer review
  console.log(`[Tension Free Science] 📩 Simulated Email to ${normalizedEmail}: Your OTP is ${otp} (valid for 5 mins)`);

  return {
    success: true,
    message: 'রেজিস্ট্রেশন সফল হয়েছে! আপনার ইমেইলে ৬ ডিজিটের ওটিপি পাঠানো হয়েছে।',
    otp,
    email: normalizedEmail
  };
}

/**
 * Verify OTP code for registration or password reset
 */
export function verifyOtpCode(email: string, otp: string): { success: boolean; message: string; user?: AuthUser } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    return { success: false, message: 'কোনো সক্রিয় ওটিপি অনুরোধ পাওয়া যায়নি। আবার কোড পাঠান।' };
  }

  if (Date.now() > user.otpExpiresAt) {
    return { success: false, message: 'ওটিপির সময় উত্তীর্ণ হয়ে গেছে। নতুন ওটিপি অনুরোধ করুন।' };
  }

  if (user.otpCode.trim() !== otp.trim()) {
    return { success: false, message: 'ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোড দিন।' };
  }

  // Mark as verified & clear OTP
  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;

  saveRegisteredUsers(users);

  if (typeof window !== 'undefined') {
    localStorage.removeItem(PENDING_OTP_KEY);
  }

  // Auto login on successful verification
  createSession(user);

  return {
    success: true,
    message: 'অ্যাকাউন্ট সফলভাবে ভেরিফাই সম্পন্ন হয়েছে!',
    user
  };
}

/**
 * Resend OTP
 */
export function resendOtp(email: string): { success: boolean; message: string; otp?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' };
  }

  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 5 * 60 * 1000;

  user.otpCode = otp;
  user.otpExpiresAt = otpExpiresAt;
  saveRegisteredUsers(users);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({ email: normalizedEmail, purpose: 'resend', otp, expiresAt: otpExpiresAt })
    );
  }

  console.log(`[Tension Free Science] 📩 Re-sent OTP to ${normalizedEmail}: ${otp}`);

  return {
    success: true,
    message: 'নতুন ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।',
    otp
  };
}

/**
 * Login user
 */
export function loginUser(email: string, plainPass: string): { success: boolean; message: string; user?: AuthUser } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। রেজিস্টার করুন।' };
  }

  if (!verifyPassword(plainPass, user.passwordHash)) {
    return { success: false, message: 'পাসওয়ার্ড সঠিক নয়! আবার চেষ্টা করুন।' };
  }

  if (!user.isVerified) {
    // Generate new OTP and prompt to verify
    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    saveRegisteredUsers(users);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        PENDING_OTP_KEY,
        JSON.stringify({ email: normalizedEmail, purpose: 'register', otp, expiresAt: user.otpExpiresAt })
      );
    }

    return {
      success: false,
      message: 'আপনার অ্যাকাউন্ট এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে ওটিপি দিয়ে ভেরিফাই করুন।',
      user
    };
  }

  createSession(user);

  return {
    success: true,
    message: 'সফলভাবে লগইন সম্পন্ন হয়েছে!',
    user
  };
}

/**
 * Forgot password request OTP
 */
export function requestPasswordReset(email: string): { success: boolean; message: string; otp?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return { success: false, message: 'এই ইমেইলের কোনো শিক্ষার্থী অ্যাকাউন্ট নেই।' };
  }

  const otp = generateOtp();
  const otpExpiresAt = Date.now() + 5 * 60 * 1000;
  user.otpCode = otp;
  user.otpExpiresAt = otpExpiresAt;
  saveRegisteredUsers(users);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({ email: normalizedEmail, purpose: 'reset', otp, expiresAt: otpExpiresAt })
    );
  }

  console.log(`[Tension Free Science] 📩 Password Reset OTP for ${normalizedEmail}: ${otp}`);

  return {
    success: true,
    message: 'পাসওয়ার্ড রিসেট ওটিপি পাঠানো হয়েছে।',
    otp
  };
}

/**
 * Reset password with verified OTP
 */
export function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPass: string
): { success: boolean; message: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || user.otpCode !== otp.trim()) {
    return { success: false, message: 'ভুল ওটিপি কোড।' };
  }

  if (user.otpExpiresAt && Date.now() > user.otpExpiresAt) {
    return { success: false, message: 'ওটিপির মেয়াদ শেষ হয়ে গেছে।' };
  }

  user.passwordHash = hashPassword(newPass);
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  saveRegisteredUsers(users);

  return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' };
}

/**
 * Session Management
 */
export function createSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    token: `tfs_jwt_${user.id}_${Date.now()}`,
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

export function getActiveSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logoutUser();
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const session = getActiveSession();
  if (!session) return null;
  const users = getRegisteredUsers();
  return users.find((u) => u.id === session.userId) || null;
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getPendingOtpData(): { email: string; purpose: string; otp: string; expiresAt: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PENDING_OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
