'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import Link from 'next/link';
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Code2,
  Calendar,
  Clock,
  ChevronRight,
  Award,
  Zap,
  BarChart3,
  Bot,
  Terminal,
  FolderGit2,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { usePlacementStats, type ActivityItem } from '@/hooks/use-placement-stats';
import { formatDistanceToNow } from 'date-fns';

const VelocityChart = dynamic(() => import('@/components/dashboard/VelocityChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/[0.04] animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
        <span className="text-xs font-mono text-slate-500">Loading velocity analytics...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { user } = useUser();
  const stats = usePlacementStats(user);

  const userName =
    stats.userProfile?.firstName ||
    user?.displayName?.split(' ')[0] ||
    'Engineer';

  const [activeChartTab, setActiveChartTab] = useState<'hours' | 'score'>('score');

  const completedGoalsCount = stats.realGoals.filter((g) => g.completed).length;
  const goalProgress = Math.round((completedGoalsCount / stats.realGoals.length) * 100);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#11182B] via-[#162038] to-[#11182B] border border-violet-500/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-40 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-violet-500/15 text-violet-300 border border-violet-500/30">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Live Firebase Synced
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                {stats.totalAptitudeTests + stats.totalQuizzes} Tests Completed
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-headline font-bold text-white tracking-tight">
              Welcome Back, <span className="gradient-text">{userName}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-light">
              Your real-time placement readiness is currently{' '}
              <strong className="text-white font-medium">{stats.readinessScore}%</strong> based on your completed evaluations.
              Target: <span className="text-violet-300 font-mono">Product SDE-1</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-violet-500/25 border-0"
            >
              <Link href="/dashboard/interview" prefetch={true} className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Start AI Mock Interview
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white"
            >
              <Link href="/dashboard/coding-assistant" prefetch={true} className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                DSA Practice
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. Key KPI Stats Cards (Connected to Real Firebase Data) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Placement Readiness Score */}
        <Card className="glass-card border-violet-500/20 relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-xl group-hover:bg-violet-600/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Readiness Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold font-mono text-white">{stats.readinessScore}%</div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live Metric
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.readinessScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Aptitude: {stats.aptitudeAccuracy}%</span>
              <span>Quiz: {stats.quizAccuracy}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Technical & Coding Quizzes */}
        <Card className="glass-card border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl group-hover:bg-blue-600/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Technical MCQ Solved
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Code2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold font-mono text-white">
                {stats.totalQuizScore}{' '}
                <span className="text-xs text-slate-500 font-normal">/ {stats.totalQuizQuestions || 0}</span>
              </div>
              <span className="text-xs font-mono text-blue-400">
                {stats.totalQuizzes} Quizzes
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.quizAccuracy}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Accuracy: {stats.quizAccuracy}%</span>
              <Link href="/dashboard/quiz" prefetch={true} className="text-blue-400 hover:underline">
                Take Quiz →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Aptitude Accuracy */}
        <Card className="glass-card border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-xl group-hover:bg-cyan-600/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Aptitude Accuracy
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold font-mono text-white">
                {stats.aptitudeAccuracy}%
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {stats.totalAptitudeTests} Tests
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.aptitudeAccuracy}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{stats.totalAptitudeScore} Correct Answers</span>
              <Link href="/dashboard/aptitude" prefetch={true} className="text-cyan-400 hover:underline">
                Test Prep →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resumes & Projects Stored in Firebase */}
        <Card className="glass-card border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-xl group-hover:bg-amber-600/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Career Assets
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold font-mono text-white">
                {stats.totalResumes + stats.totalProjects}{' '}
                <span className="text-xs text-slate-500 font-normal">Assets</span>
              </div>
              <span className="text-xs font-mono text-amber-400">Firebase Records</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.totalResumes + stats.totalProjects) * 25)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{stats.totalResumes} Resumes</span>
              <span>{stats.totalProjects} Projects</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Middle Section: Analytics Chart + Real Daily Goals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-lg font-headline font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  Performance Velocity &amp; Preparation Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Dynamic progression tracking over your last 7 active preparation days
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/60 border border-white/[0.08]">
                <button
                  onClick={() => setActiveChartTab('score')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChartTab === 'score'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Readiness Score
                </button>
                <button
                  onClick={() => setActiveChartTab('hours')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeChartTab === 'hours'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Activity Intensity
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <VelocityChart data={stats.chartData} activeChartTab={activeChartTab} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Real Daily Goals directly evaluating Firebase State */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="glass-card h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-headline font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Placement Milestones
                </CardTitle>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 font-mono text-xs">
                  {completedGoalsCount}/{stats.realGoals.length} Complete
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Key milestones computed automatically from your Firebase profile
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Track Completion</span>
                  <span>{goalProgress}%</span>
                </div>
                <Progress value={goalProgress} className="h-1.5 bg-slate-800" />
              </div>

              <div className="space-y-2.5 pt-2">
                {stats.realGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] transition-all"
                  >
                    <div className="mt-0.5">
                      {goal.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <p className={goal.completed ? 'line-through text-slate-400 font-normal' : 'font-medium text-white'}>
                        {goal.text}
                      </p>
                      <span className="text-[10px] font-mono text-violet-400 mt-0.5 inline-block">
                        #{goal.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 4. Real Recent Activity Feed Connected to Firebase */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg font-headline font-semibold text-white">
                Recent Preparation Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Live activity feed synchronized with your Firebase account
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-white/10 text-slate-300 font-mono text-xs">
              {stats.recentActivity.length} Events
            </Badge>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No activity recorded yet in your Firebase account. Select a module below to start your placement preparation!
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Button asChild size="sm" variant="outline" className="border-white/10 text-xs">
                    <Link href="/dashboard/aptitude" prefetch={true}>
                      Take Aptitude Test
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-500 text-xs text-white">
                    <Link href="/dashboard/quiz" prefetch={true}>
                      Take Tech Quiz
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform">
                        {activity.type === 'aptitude' && <BarChart3 className="w-4 h-4 text-cyan-400" />}
                        {activity.type === 'quiz' && <Code2 className="w-4 h-4 text-blue-400" />}
                        {activity.type === 'resume' && <FileText className="w-4 h-4 text-violet-400" />}
                        {activity.type === 'project' && <FolderGit2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{activity.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {activity.subtitle} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Link href={activity.href} prefetch={true} className="text-slate-400 hover:text-white ml-2 shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
