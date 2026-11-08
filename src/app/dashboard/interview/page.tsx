'use client';

import { useState, useRef, useEffect } from 'react';
import {
  simulateTechnicalInterview,
  type SimulateTechnicalInterviewOutput,
} from '@/ai/flows/simulate-technical-interviews';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  Bot,
  CheckCircle2,
  XCircle,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Send,
  RotateCcw,
  Headphones,
  Award,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface Message {
  role: 'user' | 'bot';
  content: string;
  feedback?: string;
  isSuitable?: boolean;
}

const userProfile =
  'Software Engineer with experience in algorithms, system design, React, TypeScript, and Node.js. Preparing for product-based company campus placement.';
const jobDescription =
  'Software Development Engineer (SDE-1) at top tech firm. Strong algorithmic problem solving, clean system design fundamentals, and clear communication required.';

export default function InterviewSimulatorPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport =
        scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        toast({
          title: 'Speech recognition error',
          description: event.error,
          variant: 'destructive',
        });
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInput(interimTranscript);

        if (finalTranscript) {
          handleSendMessage(finalTranscript);
          setInput('');
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const speak = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const { audio } = await textToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = audio;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.play();
      }
    } catch (error) {
      setIsPlayingAudio(false);
      toast({ title: 'Speech generation unavailable for this response.' });
    }
  };

  const startInterview = async () => {
    setMessages([]);
    const initialQuestion =
      'Welcome to your Engineers Edge AI technical placement interview! To begin, could you walk me through your technical background and a challenging architectural or algorithmic problem you recently solved?';
    setMessages([{ role: 'bot', content: initialQuestion }]);
    speak(initialQuestion);
  };

  const handleSendMessage = async (answer: string) => {
    if (!answer.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: answer },
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const previousQuestions = messages
        .filter((m) => m.role === 'bot')
        .map((m) => m.content);
      const result = await simulateTechnicalInterview({
        userProfile,
        jobDescription,
        userAnswer: answer,
        previousQuestions,
      });

      setMessages((currentMessages) => {
        const updatedMessages: Message[] = [...currentMessages];
        const lastUserMessageIndex = updatedMessages.findLastIndex(
          (m) => m.role === 'user'
        );
        if (lastUserMessageIndex !== -1) {
          updatedMessages[lastUserMessageIndex].feedback = result.feedback;
          updatedMessages[lastUserMessageIndex].isSuitable =
            result.isSuitableQuestion;
        }
        updatedMessages.push({ role: 'bot', content: result.question });
        return updatedMessages;
      });

      // Save interview progress to Firebase
      const currentUid = user?.uid || auth.currentUser?.uid;
      if (currentUid) {
        const interviewCol = collection(firestore, 'users', currentUid, 'interviewSessions');
        addDocumentNonBlocking(interviewCol, {
          userId: currentUid,
          question: result.question,
          userAnswer: answer,
          feedback: result.feedback || '',
          isSuitable: result.isSuitableQuestion || true,
          completedAt: serverTimestamp(),
        });
      }

      let speech = '';
      if (result.feedback) {
        speech += result.feedback + ' ';
      }
      speech += result.question;
      await speak(speech);
    } catch (error) {
      toast({ title: 'Error processing interview response', variant: 'destructive' });
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech recognition not supported',
        description: 'Your browser does not support Web Speech API.',
        variant: 'destructive',
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      <audio ref={audioRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-headline font-bold text-white tracking-tight">
                AI Mock Interview Simulator
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 text-violet-300">
                Voice AI
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive technical & behavioral interview with automated feedback and speech synthesis.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={startInterview}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.05] text-xs h-8"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restart Interview
          </Button>
        )}
      </div>

      {/* Main Simulation Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card border-violet-500/20 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-blue-600/20 border border-violet-500/30 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-violet-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-600 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-headline font-bold text-white">
              Ready for your SDE-1 Technical Round?
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI interviewer will ask questions on data structures, system design, and project experience, evaluate your answers, and provide real-time coaching.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] max-w-sm w-full text-left text-xs space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Target Role:</span>
              <span className="text-white font-medium">Software Engineer (SDE-1)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Voice Feedback:</span>
              <span className="text-emerald-400 font-medium">Enabled (Browser Audio)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Speech Input:</span>
              <span className="text-violet-400 font-medium">Mic Supported</span>
            </div>
          </div>

          <Button
            onClick={startInterview}
            disabled={isLoading}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium px-8 py-2.5 shadow-lg shadow-violet-500/25"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            Begin Interview Session
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 rounded-2xl glass-card border-violet-500/20 overflow-hidden">
          {/* Active Audio Visualizer Banner */}
          <div className="px-5 py-2.5 bg-slate-900/80 border-b border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="font-mono text-[11px]">INTERVIEW SESSION IN PROGRESS</span>
            </div>
            {isPlayingAudio && (
              <div className="flex items-center gap-1.5 text-violet-400 font-mono text-[11px]">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Speaking...</span>
              </div>
            )}
          </div>

          {/* Messages Scroll View */}
          <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3.5',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'bot' && (
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shrink-0 shadow-md shadow-violet-500/20">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={cn(
                        'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-md shadow-violet-500/20 rounded-tr-sm'
                          : 'bg-[#11182B] border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-md'
                      )}
                    >
                      <p>{message.content}</p>
                    </div>

                    {message.feedback && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-violet-500/25 space-y-1.5 shadow-md">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {message.isSuitable ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 size={14} /> Strong Answer
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400">
                              <XCircle size={14} /> Growth Area
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 ml-auto">AI Evaluation</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          {message.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-200 shrink-0 border border-white/[0.08]">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                    <Bot size={18} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#11182B] border border-white/[0.08] flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    <span>Interviewer is evaluating your response...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Controls */}
          <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#090D1A]/60">
            <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
              <div className="flex-1 relative rounded-xl border border-white/10 focus-within:border-violet-500/60 bg-[#11182B] transition-all">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isRecording
                      ? 'Listening to your microphone...'
                      : 'Type your answer or click the mic to speak...'
                  }
                  className="w-full bg-transparent border-0 focus-visible:ring-0 resize-none text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 min-h-[46px] max-h-32 py-3 px-3.5"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(input);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={toggleRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                disabled={isLoading}
                className={cn(
                  'h-11 w-11 shrink-0 rounded-xl transition-all',
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white bg-white/[0.04]'
                )}
                title={isRecording ? 'Stop Recording' : 'Start Speech Input'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="h-11 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-md shadow-violet-500/20 shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between max-w-4xl mx-auto mt-2 text-[10px] font-mono text-slate-400 px-1">
              <span>Respond clearly using the STAR methodology (Situation, Task, Action, Result)</span>
              <span className="text-violet-400">Voice Synthesis On</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
