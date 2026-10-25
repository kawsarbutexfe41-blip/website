import React, { useState } from 'react';
import { loginUser } from '../utils/auth.js';
import { AuthUser } from '../types/auth.js';
import {
  FlaskConical,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateHome: () => void;
  redirectMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateHome,
  redirectMessage
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('masumbillahmmn2314@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center items-center">
      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>হোমে ফিরে যাও</span>
        </button>
      </div>

      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-main)' }}>
            Tension Free Science
          </h1>
          <p className="text-xs font-semibold text-[#6C5CE7] mt-0.5">
            ভয় নয়, বিজ্ঞান হবে সহজ
          </p>
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mt-3">
            শিক্ষার্থী লগইন
          </h2>
        </div>

        {/* Redirect notice if redirected from exam */}
        {redirectMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-main)' }}>
              ইমেইল এড্রেস:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                পাসওয়ার্ড:
              </label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-xs font-semibold text-[#6C5CE7] hover:underline cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5848df] text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'লগইন হচ্ছে...' : 'লগইন করো'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Quick Fill Helper */}
        <div className="mt-5 p-3 rounded-2xl border border-dashed text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-[11px] text-slate-400">পরীক্ষার জন্য ডেমো অ্যাকাউন্ট ব্যবহার করতে পারো:</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="mt-1.5 px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#6C5CE7] font-bold text-xs hover:bg-violet-200 transition-colors cursor-pointer"
          >
            🔑 ডেমো ক্রেডেনশিয়াল পূরণ করো
          </button>
        </div>

        {/* Register Prompt */}
        <div className="mt-6 pt-4 border-t text-center text-xs" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          <span>নতুন শিক্ষার্থী? </span>
          <button
            onClick={onNavigateRegister}
            className="font-bold text-[#6C5CE7] hover:underline cursor-pointer"
          >
            এখনই ফ্রি একাউন্ট তৈরি করো
          </button>
        </div>
      </div>
    </div>
  );
};
