'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';

export interface AptitudeAttemptDoc {
  topic: string;
  score: number;
  totalQuestions: number;
  completedAt?: { seconds: number; nanoseconds: number };
}

export interface QuizAttemptDoc {
  topic: string;
  score: number;
  totalQuestions: number;
  completedAt?: { seconds: number; nanoseconds: number };
}

export interface GeneratedResumeDoc {
  jobDescription?: string;
  resumes?: string[];
  createdAt?: { seconds: number; nanoseconds: number };
}

export interface ProjectSuggestionDoc {
  title?: string;
  originalPrompt?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export interface ActivityItem {
  id: string;
  type: 'aptitude' | 'quiz' | 'resume' | 'project';
  title: string;
  subtitle: string;
  timestamp: Date;
  href: string;
}

export interface PlacementStatsResult {
  readinessScore: number;
  totalAptitudeTests: number;
  totalAptitudeQuestions: number;
  totalAptitudeScore: number;
  aptitudeAccuracy: number;
  totalQuizzes: number;
  totalQuizScore: number;
  totalQuizQuestions: number;
  quizAccuracy: number;
  totalResumes: number;
  totalProjects: number;
  userProfile: any;
  realGoals: Array<{ id: number; text: string; completed: boolean; category: string }>;
  recentActivity: ActivityItem[];
  chartData: Array<{ day: string; dateStr: string; hours: number; score: number }>;
}

const defaultStats: PlacementStatsResult = {
  readinessScore: 15,
  totalAptitudeTests: 0,
  totalAptitudeQuestions: 0,
  totalAptitudeScore: 0,
  aptitudeAccuracy: 0,
  totalQuizzes: 0,
  totalQuizScore: 0,
  totalQuizQuestions: 0,
  quizAccuracy: 0,
  totalResumes: 0,
  totalProjects: 0,
  userProfile: null,
  realGoals: [
    { id: 1, text: 'Take a Technical MCQ Quiz Challenge', completed: false, category: 'Quiz' },
    { id: 2, text: 'Complete an Aptitude Screening Test', completed: false, category: 'Aptitude' },
    { id: 3, text: 'Generate an ATS-Optimized Resume', completed: false, category: 'Resume' },
    { id: 4, text: 'Complete Candidate Profile & Settings', completed: false, category: 'Profile' },
  ],
  recentActivity: [],
  chartData: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({
    day,
    dateStr: '',
    hours: 0,
    score: 15,
  })),
};

const PlacementStatsContext = createContext<PlacementStatsResult>(defaultStats);

function usePlacementStatsInternal(user: any): PlacementStatsResult {
  const firestore = useFirestore();

  // 1. Real Aptitude Test Attempts from Firebase
  const aptitudeQuery = useMemoFirebase(() => {
    if (!user || !user.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'aptitudeTestAttempts'),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
  }, [user?.uid, firestore]);
  const { data: aptitudeAttempts } = useCollection<AptitudeAttemptDoc>(aptitudeQuery);

  // 2. Real Technical Quiz Attempts from Firebase
  const quizQuery = useMemoFirebase(() => {
    if (!user || !user.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'quizAttempts'),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
  }, [user?.uid, firestore]);
  const { data: quizAttempts } = useCollection<QuizAttemptDoc>(quizQuery);

  // 3. Real Generated Resumes from Firebase
  const resumeQuery = useMemoFirebase(() => {
    if (!user || !user.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'generatedResumes'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user?.uid, firestore]);
  const { data: resumes } = useCollection<GeneratedResumeDoc>(resumeQuery);

  // 4. Real Project Blueprints from Firebase
  const projectQuery = useMemoFirebase(() => {
    if (!user || !user.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'projectSuggestions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user?.uid, firestore]);
  const { data: projects } = useCollection<ProjectSuggestionDoc>(projectQuery);

  // 5. Real User Profile Document from Firebase
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !user.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);
  const { data: userProfile } = useDoc<any>(userProfileRef);

  return useMemo(() => {
    // --- Aptitude Calculations ---
    const totalAptitudeTests = aptitudeAttempts?.length || 0;
    const totalAptitudeScore = aptitudeAttempts?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
    const totalAptitudeQuestions = aptitudeAttempts?.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0) || 0;
    const aptitudeAccuracy = totalAptitudeQuestions > 0
      ? Math.round((totalAptitudeScore / totalAptitudeQuestions) * 100)
      : 0;

    // --- Technical Quiz Calculations ---
    const totalQuizzes = quizAttempts?.length || 0;
    const totalQuizScore = quizAttempts?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
    const totalQuizQuestions = quizAttempts?.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0) || 0;
    const quizAccuracy = totalQuizQuestions > 0
      ? Math.round((totalQuizScore / totalQuizQuestions) * 100)
      : 0;

    // --- Dynamic Placement Readiness Formula ---
    let score = 15;
    if (userProfile?.firstName || userProfile?.lastName || userProfile?.linkedInProfile) {
      score += 15;
    }
    if ((resumes?.length || 0) > 0) {
      score += 20;
    }
    if (totalAptitudeTests > 0) {
      score += Math.round((aptitudeAccuracy / 100) * 25);
    }
    if (totalQuizzes > 0) {
      score += Math.round((quizAccuracy / 100) * 25);
    }
    const readinessScore = Math.min(100, score);

    // --- Dynamic Daily Goals connected to Real Firebase State ---
    const realGoals = [
      {
        id: 1,
        text: 'Take a Technical MCQ Quiz Challenge',
        completed: totalQuizzes > 0,
        category: 'Quiz',
      },
      {
        id: 2,
        text: 'Complete an Aptitude Screening Test',
        completed: totalAptitudeTests > 0,
        category: 'Aptitude',
      },
      {
        id: 3,
        text: 'Generate an ATS-Optimized Resume',
        completed: (resumes?.length || 0) > 0,
        category: 'Resume',
      },
      {
        id: 4,
        text: 'Complete Candidate Profile & Settings',
        completed: !!(userProfile?.firstName && userProfile?.lastName),
        category: 'Profile',
      },
    ];

    // --- Real Activity Feed from all Firebase Subcollections ---
    const activityItems: ActivityItem[] = [];

    aptitudeAttempts?.forEach((att) => {
      activityItems.push({
        id: att.id,
        type: 'aptitude',
        title: `Aptitude: ${att.topic}`,
        subtitle: `Score: ${att.score}/${att.totalQuestions} (${Math.round((att.score / att.totalQuestions) * 100)}% accuracy)`,
        timestamp: att.completedAt?.seconds ? new Date(att.completedAt.seconds * 1000) : new Date(),
        href: '/dashboard/aptitude',
      });
    });

    quizAttempts?.forEach((q) => {
      activityItems.push({
        id: q.id,
        type: 'quiz',
        title: `Technical Quiz: ${q.topic}`,
        subtitle: `Score: ${q.score}/${q.totalQuestions} solved`,
        timestamp: q.completedAt?.seconds ? new Date(q.completedAt.seconds * 1000) : new Date(),
        href: '/dashboard/quiz',
      });
    });

    resumes?.forEach((r) => {
      activityItems.push({
        id: r.id,
        type: 'resume',
        title: 'ATS Resume Generated',
        subtitle: r.jobDescription ? `Target: ${r.jobDescription.slice(0, 36)}...` : 'Optimized for campus placement',
        timestamp: r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : new Date(),
        href: '/dashboard/resume',
      });
    });

    projects?.forEach((p) => {
      activityItems.push({
        id: p.id,
        type: 'project',
        title: `Project: ${p.title || 'Portfolio Blueprint'}`,
        subtitle: p.originalPrompt ? `Prompt: ${p.originalPrompt.slice(0, 32)}...` : 'System architecture drafted',
        timestamp: p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : new Date(),
        href: '/dashboard/projects',
      });
    });

    activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // --- Weekly Real Velocity Chart Data ---
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        day: days[d.getDay()],
        dateStr: d.toDateString(),
        hours: 0,
        score: readinessScore,
      };
    });

    activityItems.forEach((act) => {
      const actDateStr = act.timestamp.toDateString();
      const match = last7Days.find((d) => d.dateStr === actDateStr);
      if (match) {
        match.hours = Math.min(8, match.hours + 0.8);
      }
    });

    return {
      readinessScore,
      totalAptitudeTests,
      totalAptitudeQuestions,
      totalAptitudeScore,
      aptitudeAccuracy,
      totalQuizzes,
      totalQuizScore,
      totalQuizQuestions,
      quizAccuracy,
      totalResumes: resumes?.length || 0,
      totalProjects: projects?.length || 0,
      userProfile,
      realGoals,
      recentActivity: activityItems.slice(0, 6),
      chartData: last7Days,
    };
  }, [aptitudeAttempts, quizAttempts, resumes, projects, userProfile]);
}

/**
 * Provider that runs the 5 Firestore subcollection queries ONCE at the layout level.
 * Prevents multiple child components (Sidebar, DashboardPage) from duplicating listeners
 * and crashing Firestore's internal gRPC connection.
 */
export function PlacementStatsProvider({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const stats = usePlacementStatsInternal(user);
  return React.createElement(PlacementStatsContext.Provider, { value: stats }, children);
}

/**
 * Hook to consume placement preparation stats.
 * Uses shared context if available; otherwise falls back to internal hook.
 */
export function usePlacementStats(user?: any): PlacementStatsResult {
  const context = useContext(PlacementStatsContext);
  if (context !== defaultStats) {
    return context;
  }
  return usePlacementStatsInternal(user);
}
