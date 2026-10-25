import React, { useState } from 'react';
import { registerUser } from '../utils/auth.js';
import {
  FlaskConical,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building,
  ArrowRight,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

interface RegisterPageProps {
  onSuccess: (email: string) => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateHome
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentClass, setStudentClass] = useState<'9' | '10'>('10');
  const [school, setSchool] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name,
        email,
        password,
        studentClass,
        school
      });
      setIsLoading(false);

      if (res.success && res.email) {
        onSuccess(res.email);
      } else {
        setError(res.message);
      }
    }, 400);
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
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mt-2">
            নতুন শিক্ষার্থী নিবন্ধন
          </h2>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-main)' }}>
              শিক্ষার্থীর পূর্ণ নাম:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: সাকিব হাসান"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          {/* Email (Gmail) */}
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-main)' }}>
              ইমেইল এড্রেস (Gmail):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-main)' }}>
              পাসওয়ার্ড:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          {/* Class (9 or 10) */}
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-main)' }}>
              শ্রেণি নির্বাচন করো:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStudentClass('9')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  studentClass === '9'
                    ? 'bg-violet-50 text-[#6C5CE7] border-[#6C5CE7] dark:bg-violet-950/60'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700'
                }`}
              >
                নবম শ্রেণি (Class 9)
              </button>
              <button
                type="button"
                onClick={() => setStudentClass('10')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  studentClass === '10'
                    ? 'bg-violet-50 text-[#6C5CE7] border-[#6C5CE7] dark:bg-violet-950/60'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700'
                }`}
              >
                দশম শ্রেণি / এসএসসি (Class 10)
              </button>
            </div>
          </div>

          {/* School (Optional) */}
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-main)' }}>
              বিদ্যালয়ের নাম (ঐচ্ছিক):
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="যেমন: ভিকারুননিসা নূন স্কুল / ঢাকা কলেজিয়েট স্কুল"
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
            className="w-full py-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5848df] text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'নিবন্ধন হচ্ছে...' : 'ওটিপি ভেরিফিকেশন পাঠান'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login Prompt */}
        <div className="mt-5 pt-4 border-t text-center text-xs" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
          <button
            onClick={onNavigateLogin}
            className="font-bold text-[#6C5CE7] hover:underline cursor-pointer"
          >
            লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
