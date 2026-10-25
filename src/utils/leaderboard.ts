import { LeaderboardEntry, UserProfile } from '../types/quiz.js';
import { calculateAccuracy, calculateLevel } from './quizLogic.js';
import { getRegisteredUsers } from './auth.js';

/**
 * Computes the real leaderboard based STRICTLY on registered users
 * from localStorage ('tfs_users' / auth system) who have taken at least 1 exam.
 * No fake/mock users are ever included.
 */
export function getRealLeaderboard(currentUser?: UserProfile): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];

  let rawUsers: any[] = [];
  try {
    const raw = localStorage.getItem('tfs_users') || localStorage.getItem('tfs_registered_users_v1');
    if (raw) {
      rawUsers = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading tfs_users from localStorage:', e);
  }

  // Fallback to auth helper if empty
  if (!rawUsers || rawUsers.length === 0) {
    rawUsers = getRegisteredUsers();
  }

  const entries: LeaderboardEntry[] = [];
  let currentUserMatched = false;

  for (const u of rawUsers) {
    const isThisCurrentUser = !!currentUser && (
      (u.name && u.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
      (u.email && (currentUser as any).email && u.email.toLowerCase() === (currentUser as any).email.toLowerCase())
    );

    // Merge current session stats if this is the active user
    const totalExams = isThisCurrentUser
      ? Math.max(u.totalExams || 0, currentUser?.totalExams || 0)
      : (u.totalExams || 0);

    const totalXP = isThisCurrentUser
      ? Math.max(u.totalXP || 0, currentUser?.totalXP || 0)
      : (u.totalXP || 0);

    const totalCorrect = isThisCurrentUser
      ? Math.max(u.totalCorrect || 0, currentUser?.totalCorrect || 0)
      : (u.totalCorrect || 0);

    const totalAttempted = isThisCurrentUser
      ? Math.max(u.totalAttempted || 0, currentUser?.totalAttempted || 0)
      : (u.totalAttempted || 0);

    // CRITICAL: ONLY include users who have taken AT LEAST 1 exam
    if (totalExams > 0) {
      if (isThisCurrentUser) currentUserMatched = true;

      entries.push({
        rank: 0,
        id: u.id || `usr_${u.name}`,
        name: u.name,
        school: (isThisCurrentUser ? currentUser?.school : u.school) || u.school || 'বাংলাদেশ মাধ্যমিক বিদ্যালয়',
        district: u.district || 'ঢাকা',
        avatar: (isThisCurrentUser ? currentUser?.avatar : u.avatar) || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        level: calculateLevel(totalXP),
        totalXP,
        totalExams,
        accuracy: calculateAccuracy(totalCorrect, totalAttempted),
        isCurrentUser: isThisCurrentUser
      });
    }
  }

  // If current active user has taken exams but was not in the registered list, include them
  if (currentUser && !currentUserMatched && (currentUser.totalExams || 0) > 0) {
    entries.push({
      rank: 0,
      id: 'current_user',
      name: currentUser.name,
      school: currentUser.school || 'বাংলাদেশ মাধ্যমিক বিদ্যালয়',
      district: 'ঢাকা',
      avatar: currentUser.avatar,
      level: currentUser.level,
      totalXP: currentUser.totalXP,
      totalExams: currentUser.totalExams,
      accuracy: calculateAccuracy(currentUser.totalCorrect, currentUser.totalAttempted),
      isCurrentUser: true
    });
  }

  // Sort descending by totalXP
  entries.sort((a, b) => b.totalXP - a.totalXP);

  // Assign sequential 1-based ranks
  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));
}
