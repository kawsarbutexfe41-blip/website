import { UserProfile, ExamResult } from '../types/quiz.js';
import { calculateLevel } from './quizLogic.js';

const STORAGE_KEY = 'class910_livemcq_user_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'মাসুম বিল্লাহ',
  school: 'রাজউক উত্তরা মডেল কলেজ',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  totalXP: 140,
  level: 2,
  totalExams: 2,
  totalCorrect: 16,
  totalAttempted: 20,
  accuracyHistory: [75, 85],
  attemptedIds: [],
  recentExams: []
};

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_USER_PROFILE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      level: calculateLevel(parsed.totalXP || 0)
    };
  } catch (e) {
    console.error('Error reading user profile from localStorage:', e);
    return DEFAULT_USER_PROFILE;
  }
}

import { updateUserExamStats, getCurrentUser } from './auth.js';

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    profile.level = calculateLevel(profile.totalXP);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    // Also sync with tfs_users
    const active = getCurrentUser();
    const identifier = active ? active.id : profile.name;
    updateUserExamStats(identifier, {
      totalXP: profile.totalXP,
      level: profile.level,
      totalExams: profile.totalExams,
      totalCorrect: profile.totalCorrect,
      totalAttempted: profile.totalAttempted,
      school: profile.school,
      avatar: profile.avatar
    });
  } catch (e) {
    console.error('Error saving user profile to localStorage:', e);
  }
}

export function recordExamCompletion(result: ExamResult): UserProfile {
  const current = getUserProfile();

  // Add attempted question IDs without duplicates
  const newAttemptedIds = [...current.attemptedIds];
  result.answers.forEach(a => {
    if (!newAttemptedIds.includes(a.question.id)) {
      newAttemptedIds.push(a.question.id);
    }
  });

  const updatedXP = current.totalXP + result.scoreXP;
  const updatedTotalExams = current.totalExams + 1;
  const updatedTotalCorrect = current.totalCorrect + result.correctCount;
  const updatedTotalAttempted = current.totalAttempted + (result.totalQuestions - result.skippedCount);
  const updatedAccuracyHistory = [...current.accuracyHistory.slice(-19), result.accuracy];
  const updatedRecentExams = [result, ...current.recentExams.slice(0, 9)];

  const updated: UserProfile = {
    ...current,
    totalXP: updatedXP,
    level: calculateLevel(updatedXP),
    totalExams: updatedTotalExams,
    totalCorrect: updatedTotalCorrect,
    totalAttempted: updatedTotalAttempted,
    accuracyHistory: updatedAccuracyHistory,
    attemptedIds: newAttemptedIds,
    recentExams: updatedRecentExams
  };

  saveUserProfile(updated);
  return updated;
}
