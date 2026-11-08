'use client';

import { useMemoFirebase, useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, History, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuizAttempt {
  topic: string;
  score: number;
  totalQuestions: number;
  completedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function PastQuizzes() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const currentUid = user?.uid || auth.currentUser?.uid;

  const quizAttemptsQuery = useMemoFirebase(() => {
    if (!currentUid) return null;
    return query(
      collection(firestore, 'users', currentUid, 'quizAttempts'),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
  }, [currentUid, firestore]);

  const { data: attempts, isLoading } = useCollection<QuizAttempt>(quizAttemptsQuery);

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) {
      return (
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          {score} / {total} ({percentage}%)
        </span>
      );
    }
    if (percentage >= 60) {
      return (
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
          {score} / {total} ({percentage}%)
        </span>
      );
    }
    return (
      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
        {score} / {total} ({percentage}%)
      </span>
    );
  };

  return (
    <div className="pt-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-headline font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" />
                Recent Technical Quiz Attempts
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Evaluation history across languages, frameworks, and CS fundamentals
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-white/10 text-slate-400 font-mono text-[10px]">
              Last 10 Quizzes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          )}
          {!isLoading && (!attempts || attempts.length === 0) && (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No quiz attempts recorded yet. Select a topic above to begin!</p>
            </div>
          )}
          {!isLoading && attempts && attempts.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-xs font-mono text-slate-400">Topic</TableHead>
                    <TableHead className="text-center text-xs font-mono text-slate-400">Score & Accuracy</TableHead>
                    <TableHead className="text-right text-xs font-mono text-slate-400">Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt: WithId<QuizAttempt>) => (
                    <TableRow key={attempt.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell className="font-medium text-xs text-white">
                        {attempt.topic}
                      </TableCell>
                      <TableCell className="text-center">
                        {getScoreBadge(attempt.score, attempt.totalQuestions)}
                      </TableCell>
                      <TableCell className="text-right text-slate-400 text-xs font-mono">
                        {attempt.completedAt?.seconds
                          ? formatDistanceToNow(new Date(attempt.completedAt.seconds * 1000), {
                              addSuffix: true,
                            })
                          : 'Just now'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
