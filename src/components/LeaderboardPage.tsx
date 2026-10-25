import React, { useMemo } from 'react';
import { UserProfile } from '../types/quiz.js';
import { getRealLeaderboard } from '../utils/leaderboard.js';
import { toBengaliNumber, calculateAccuracy } from '../utils/quizLogic.js';
import {
  Trophy,
  Crown,
  Award,
  ChevronLeft,
  Sparkles,
  Medal
} from 'lucide-react';

interface LeaderboardPageProps {
  user: UserProfile;
  onBack: () => void;
  onStartExam?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  user,
  onBack,
  onStartExam
}) => {
  const userAccuracy = calculateAccuracy(user.totalCorrect, user.totalAttempted);

  // Retrieve strictly real registered users who took at least 1 exam
  const realLeaderboard = useMemo(() => {
    return getRealLeaderboard(user);
  }, [user]);

  const isEmpty = realLeaderboard.length === 0;
  const myRankEntry = realLeaderboard.find((e) => e.isCurrentUser);
  const top3 = realLeaderboard.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-20 overflow-x-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border font-bold text-xs shadow-xs cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>হোমে ফিরে যাও</span>
        </button>

        <div className="text-right">
          <span className="text-[11px] sm:text-xs font-bold text-[#6C5CE7] bg-violet-50 dark:bg-violet-950/50 px-2.5 py-1 rounded-full border border-violet-100 dark:border-violet-800">
            TFS লাইভ লিডারবোর্ড ২০২৬
          </span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-200 dark:shadow-none mb-2.5">
          <Trophy className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight break-words" style={{ color: 'var(--text-main)' }}>
          জাতীয় শীর্ষ শিক্ষার্থী তালিকা
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          পরীক্ষা দিয়ে এক্সপি অর্জন করো এবং দেশসেরা শিক্ষার্থীদের তালিকায় এগিয়ে যাও!
        </p>
      </div>

      {/* EMPTY STATE: Shown when no users have completed an exam */}
      {isEmpty ? (
        <div
          className="rounded-3xl p-8 sm:p-12 border shadow-sm text-center max-w-md mx-auto my-8 transition-colors"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center shadow-xl shadow-amber-200 dark:shadow-none relative z-10 animate-bounce">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
            এখনো কেউ পরীক্ষা দেয়নি!
          </h2>
          <p className="text-xs sm:text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            তুমি প্রথম পরীক্ষা দিয়ে লিডারবোর্ডে ১ম স্থান দখল করো।
          </p>

          <button
            onClick={onStartExam || onBack}
            className="px-6 py-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5846E0] text-white font-black text-sm sm:text-base shadow-lg shadow-violet-500/25 transition-all transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>এখনই পরীক্ষা দাও</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Podium - Adapts cleanly if 1, 2, or 3+ users exist */}
          {top3.length === 1 ? (
            /* Single User Podium (e.g. 1st Place Solo Champion) */
            <div className="flex justify-center max-w-xs mx-auto mb-8 sm:mb-10">
              <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100/30 dark:from-amber-950/50 dark:to-slate-900 rounded-3xl p-4 sm:p-6 border-2 border-amber-400 shadow-xl text-center flex flex-col items-center">
                <Crown className="w-8 h-8 text-amber-500 fill-amber-400 mb-1 animate-bounce" />
                <div className="relative mb-2">
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-sm">
                    ১
                  </div>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold truncate max-w-full mt-1" style={{ color: 'var(--text-main)' }}>
                  {top3[0].name}
                </h4>
                <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-full">
                  {top3[0].school}
                </span>
                <div className="mt-2 text-xs sm:text-sm font-black text-amber-900 dark:text-amber-100 bg-amber-300 dark:bg-amber-800 px-3 py-1 rounded-full shadow-xs">
                  {toBengaliNumber(top3[0].totalXP)} XP
                </div>
              </div>
            </div>
          ) : top3.length === 2 ? (
            /* 2 Users Podium */
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto mb-8 sm:mb-10 items-end">
              {/* 2nd Place */}
              <div
                className="rounded-3xl p-3 sm:p-4 border shadow-xs text-center flex flex-col items-center"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black mb-1.5">
                  ২
                </div>
                <img
                  src={top3[1].avatar}
                  alt={top3[1].name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-slate-300 mb-1.5"
                />
                <h4 className="text-xs sm:text-sm font-bold truncate max-w-full" style={{ color: 'var(--text-main)' }}>
                  {top3[1].name}
                </h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-full">
                  {top3[1].school.split(' ')[0]}
                </span>
                <div className="mt-1.5 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}>
                  {toBengaliNumber(top3[1].totalXP)} XP
                </div>
              </div>

              {/* 1st Place */}
              <div className="bg-gradient-to-b from-amber-50 to-amber-100/30 dark:from-amber-950/50 dark:to-slate-900 rounded-3xl p-3 sm:p-5 border-2 border-amber-400 shadow-xl text-center flex flex-col items-center scale-105 z-10">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 fill-amber-400 mb-1 animate-bounce" />
                <img
                  src={top3[0].avatar}
                  alt={top3[0].name}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400 mb-1.5"
                />
                <h4 className="text-xs sm:text-base font-extrabold truncate max-w-full" style={{ color: 'var(--text-main)' }}>
                  {top3[0].name}
                </h4>
                <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-full">
                  {top3[0].school.split(' ')[0]}
                </span>
                <div className="mt-1.5 text-[11px] sm:text-xs font-black text-amber-900 dark:text-amber-100 bg-amber-300 dark:bg-amber-800 px-2.5 py-0.5 rounded-full shadow-xs">
                  {toBengaliNumber(top3[0].totalXP)} XP
                </div>
              </div>
            </div>
          ) : (
            /* Standard 3-Column Podium */
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-8 sm:mb-10 items-end">
              {/* 2nd Place */}
              <div
                className="rounded-3xl p-2.5 sm:p-4 border shadow-xs text-center flex flex-col items-center"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black mb-1.5">
                  ২
                </div>
                <img
                  src={top3[1].avatar}
                  alt={top3[1].name}
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-slate-300 mb-1.5"
                />
                <h4 className="text-[11px] sm:text-sm font-bold truncate max-w-full" style={{ color: 'var(--text-main)' }}>
                  {top3[1].name}
                </h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-full">
                  {top3[1].school.split(' ')[0]}
                </span>
                <div className="mt-1.5 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}>
                  {toBengaliNumber(top3[1].totalXP)} XP
                </div>
              </div>

              {/* 1st Place */}
              <div className="bg-gradient-to-b from-amber-50 to-amber-100/30 dark:from-amber-950/50 dark:to-slate-900 rounded-3xl p-3 sm:p-5 border-2 border-amber-400 shadow-xl text-center flex flex-col items-center scale-105 z-10">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 fill-amber-400 mb-1 animate-bounce" />
                <img
                  src={top3[0].avatar}
                  alt={top3[0].name}
                  className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400 mb-1.5"
                />
                <h4 className="text-xs sm:text-base font-extrabold truncate max-w-full" style={{ color: 'var(--text-main)' }}>
                  {top3[0].name}
                </h4>
                <span className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-full">
                  {top3[0].school.split(' ')[0]}
                </span>
                <div className="mt-1.5 text-[11px] sm:text-xs font-black text-amber-900 dark:text-amber-100 bg-amber-300 dark:bg-amber-800 px-2.5 py-0.5 rounded-full shadow-xs">
                  {toBengaliNumber(top3[0].totalXP)} XP
                </div>
              </div>

              {/* 3rd Place */}
              <div
                className="rounded-3xl p-2.5 sm:p-4 border shadow-xs text-center flex flex-col items-center"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black mb-1.5">
                  ৩
                </div>
                <img
                  src={top3[2].avatar}
                  alt={top3[2].name}
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-amber-200 mb-1.5"
                />
                <h4 className="text-[11px] sm:text-sm font-bold truncate max-w-full" style={{ color: 'var(--text-main)' }}>
                  {top3[2].name}
                </h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-full">
                  {top3[2].school.split(' ')[0]}
                </span>
                <div className="mt-1.5 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}>
                  {toBengaliNumber(top3[2].totalXP)} XP
                </div>
              </div>
            </div>
          )}

          {/* Current User Highlighted Status Card ("তোমার অবস্থান - #X" with purple background) */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base sm:text-lg font-black text-white shrink-0">
                #{toBengaliNumber(myRankEntry ? myRankEntry.rank : 1)}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-white/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate">
                  <h3 className="font-bold text-sm sm:text-lg truncate">{user.name} (তোমার অবস্থান)</h3>
                  <span className="text-[10px] sm:text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-md shrink-0">
                    লেভেল {toBengaliNumber(user.level)}
                  </span>
                </div>
                <p className="text-xs text-white/80 truncate">{user.school || 'বাংলাদেশ মাধ্যমিক বিদ্যালয়'}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-white/20 shrink-0">
              <div className="text-lg sm:text-2xl font-black text-white">
                {toBengaliNumber(user.totalXP)} XP
              </div>
              <div className="text-xs text-white/80 font-medium">
                নির্ভুলতা: {toBengaliNumber(userAccuracy)}%
              </div>
            </div>
          </div>

          {/* Ranked Table - Shows ONLY real users */}
          <div
            className="rounded-3xl border shadow-xs overflow-hidden transition-colors"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--card-border)'
            }}
          >
            <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <Award className="w-4 h-4 text-[#6C5CE7]" />
                <span>পূর্ণাঙ্গ মেধা তালিকা ({toBengaliNumber(realLeaderboard.length)} জন শিক্ষার্থী)</span>
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>র‍্যাঙ্ক ও অর্জিত পয়েন্ট</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
              {realLeaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-violet-50/70 dark:bg-violet-950/40 border-l-4 border-l-[#6C5CE7]'
                      : 'hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        entry.rank === 1
                          ? 'bg-amber-100 text-amber-800'
                          : entry.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : entry.rank === 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {toBengaliNumber(entry.rank)}
                    </span>

                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="font-bold text-xs sm:text-base truncate" style={{ color: 'var(--text-main)' }}>
                          {entry.name}
                        </h4>
                        {entry.isCurrentUser && (
                          <span className="text-[9px] sm:text-[10px] font-bold bg-[#6C5CE7] text-white px-1.5 py-0.5 rounded shrink-0">
                            তুমি
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] truncate flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span>{entry.school}</span>
                        {entry.district && (
                          <>
                            <span>•</span>
                            <span>{entry.district}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-xs sm:text-base" style={{ color: 'var(--text-main)' }}>
                      {toBengaliNumber(entry.totalXP)}{' '}
                      <span className="text-[10px] sm:text-xs text-[#6C5CE7] font-bold">XP</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      লেভেল {toBengaliNumber(entry.level)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
