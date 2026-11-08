'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateQuiz, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lightbulb,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { curatedAptitudeBanks } from '@/lib/curated-questions';

const quizMemoryCache = new Map<string, GenerateQuizOutput>();

interface QuizResult {
  question: QuizQuestion;
  selectedAnswer: string;
  isCorrect: boolean;
}

export default function AptitudeTestClient({
  topic,
  onBack,
}: {
  topic: string;
  onBack: () => void;
}) {
  const cached = quizMemoryCache.get(topic) || curatedAptitudeBanks[topic] || null;
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (quizMemoryCache.has(topic)) {
      setQuiz(quizMemoryCache.get(topic)!);
      setIsLoading(false);
      return;
    }

    let active = true;
    const fetchQuiz = async () => {
      // Set a fallback timer of 4 seconds so user is never stuck
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const generatePromise = generateQuiz({
        topic: `Aptitude Test: ${topic}`,
        numQuestions: 10,
      }).catch(() => null);

      try {
        const result = await Promise.race([generatePromise, timeoutPromise]);
        if (!active) return;

        if (result && result.questions && result.questions.length > 0) {
          quizMemoryCache.set(topic, result);
          setQuiz(result);
        } else if (curatedAptitudeBanks[topic]) {
          // Instant high-yield fallback
          setQuiz(curatedAptitudeBanks[topic]);
        } else {
          // As a last resort, wait for generator
          const lateResult = await generatePromise;
          if (active && lateResult) {
            quizMemoryCache.set(topic, lateResult);
            setQuiz(lateResult);
          }
        }
      } catch {
        if (active && curatedAptitudeBanks[topic]) {
          setQuiz(curatedAptitudeBanks[topic]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchQuiz();
    return () => {
      active = false;
    };
  }, [topic]);

  const saveAptitudeTestAttempt = useCallback(
    async (finalResults: QuizResult[], finalQuiz: GenerateQuizOutput) => {
      const currentUid = user?.uid || auth.currentUser?.uid;
      if (!currentUid) {
        console.warn('Cannot save test attempt: No active user authenticated');
        return;
      }

      const score = finalResults.filter((r) => r.isCorrect).length;
      const totalQuestions = finalQuiz.questions.length;

      const attemptsCol = collection(
        firestore,
        'users',
        currentUid,
        'aptitudeTestAttempts'
      );
      addDocumentNonBlocking(attemptsCol, {
        userId: currentUid,
        topic: topic,
        score,
        totalQuestions,
        completedAt: serverTimestamp(),
      });

      toast({
        title: 'Test attempt saved!',
        description: 'Your results have been saved to your placement record.',
      });
    },
    [user, auth.currentUser, firestore, topic, toast]
  );

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const newResult = { question: currentQuestion, selectedAnswer, isCorrect };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);
    setIsAnswered(true);

    if (currentQuestionIndex === quiz.questions.length - 1) {
      saveAptitudeTestAttempt(updatedResults, quiz);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 min-h-[400px] rounded-2xl glass-card border-violet-500/20">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
        </div>
        <h3 className="text-lg font-headline font-semibold text-white">
          Synthesizing Dynamic {topic} Test
        </h3>
        <p className="mt-2 text-xs text-slate-400 max-w-sm">
          Gemini 2.5 Flash is curating 10 high-yield questions based on recent placement drive patterns...
        </p>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl glass-card">
        <p className="text-slate-300">Could not load the test questions.</p>
        <Button onClick={onBack} className="mt-4 bg-violet-600 hover:bg-violet-500 text-white">
          Go Back
        </Button>
      </div>
    );
  }

  const isQuizFinished = currentQuestionIndex >= quiz.questions.length;

  if (isQuizFinished) {
    const score = results.filter((r) => r.isCorrect).length;
    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="w-full space-y-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="border-white/10 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
        </Button>

        {/* Score Summary Banner */}
        <div className="p-8 rounded-2xl glass-card border-violet-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-md mx-auto">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-white">Test Completed!</h2>
            <div className="text-5xl font-mono font-bold text-white tracking-tight">
              {score} <span className="text-xl text-slate-500">/ {total}</span>
            </div>
            <p className="text-sm font-mono text-violet-300">
              Accuracy: {percentage}% • {percentage >= 80 ? 'Placement Ready 🎉' : 'Keep Practicing 📈'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button onClick={onBack} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs">
                Take Another Test
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-headline font-semibold text-white">
            Performance Breakdown & Explanations
          </h3>

          {results.map((result, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl glass-card border-white/[0.08] space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-white">
                  <span className="font-mono text-violet-400 font-semibold mr-2">Q{index + 1}.</span>
                  {result.question.questionText}
                </p>
                <Badge
                  variant={result.isCorrect ? 'default' : 'destructive'}
                  className={cn(
                    'font-mono text-[10px] shrink-0',
                    result.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  )}
                >
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </Badge>
              </div>

              <div className="text-xs space-y-1 font-mono pt-1">
                <p className={result.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                  Your Answer: {result.selectedAnswer}
                </p>
                {!result.isCorrect && (
                  <p className="text-slate-300">
                    Correct Answer: <span className="text-emerald-400">{result.question.correctAnswer}</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-start gap-2.5 text-xs text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{result.question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit Test
        </Button>
        <span className="text-xs font-mono text-slate-400">
          Question <strong className="text-white font-bold">{currentQuestionIndex + 1}</strong> of {quiz.questions.length}
        </span>
      </div>

      <Progress value={progress} className="h-1.5 bg-slate-800" />

      {/* Question Card */}
      <Card className="glass-card border-violet-500/20">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit text-[10px] font-mono border-violet-500/30 text-violet-300 mb-2">
            {topic}
          </Badge>
          <CardTitle className="text-base sm:text-lg text-white font-medium leading-relaxed">
            {currentQuestion.questionText}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between border',
                    isSelected &&
                      !isAnswered &&
                      'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/10 ring-1 ring-violet-500',
                    !isSelected &&
                      !isAnswered &&
                      'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:text-white hover:border-white/20',
                    isAnswered &&
                      isCorrect &&
                      'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold',
                    isAnswered &&
                      isSelected &&
                      !isCorrect &&
                      'bg-rose-950/40 border-rose-500/50 text-rose-300 font-semibold',
                    isAnswered && !isSelected && !isCorrect && 'opacity-40 border-white/[0.04]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border',
                        isSelected && !isAnswered
                          ? 'bg-violet-600 text-white border-violet-400'
                          : 'bg-slate-900 border-white/10 text-slate-400'
                      )}
                    >
                      {optionLabels[index]}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1.5 mt-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Lightbulb size={14} />
                <span>Explanation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-white/[0.08] flex justify-end">
          {isAnswered ? (
            <Button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-medium px-6"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                'Finish & View Score'
              ) : (
                <span className="flex items-center gap-1.5">
                  Next Question <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-medium px-6"
            >
              Submit Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
