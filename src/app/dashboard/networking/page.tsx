'use client';

import { useState, useRef, useEffect } from 'react';
import {
  provideAiNetworkingSuggestions,
  type NetworkingSuggestionOutput,
} from '@/ai/flows/provide-ai-networking-suggestions';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Lightbulb,
  Users,
  Calendar,
  Mic,
  MicOff,
  Loader2,
  Sparkles,
  ArrowRight,
  Handshake,
  Compass,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const quickGoalTemplates = [
  'Looking for senior engineering mentors in Distributed Systems & Microservices',
  'Need strategies for Cold Emailing recruiters & hiring managers for SDE-1 referrals',
  'Want to contribute to top open-source repositories and build community presence',
];

const mentorCache = new Map<string, NetworkingSuggestionOutput>();

function NetworkingSuggestions({
  suggestions,
}: {
  suggestions: NetworkingSuggestionOutput;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* 1. Direct Networking */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-violet-500/20">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-base font-headline font-bold text-white">
            Targeted Networking
          </h2>
        </div>
        {suggestions.networkingSuggestions.length > 0 ? (
          suggestions.networkingSuggestions.map((s, i) => (
            <Card key={`net-${i}`} className="glass-card border-violet-500/20 hover:border-violet-500/40 transition-all">
              <CardContent className="pt-4 text-xs text-slate-200 leading-relaxed">
                {s}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-xs text-slate-500">No suggestions available.</p>
        )}
      </div>

      {/* 2. Mentorship */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-base font-headline font-bold text-white">
            Mentorship Paths
          </h2>
        </div>
        {suggestions.mentorshipOpportunities.length > 0 ? (
          suggestions.mentorshipOpportunities.map((s, i) => (
            <Card key={`men-${i}`} className="glass-card border-blue-500/20 hover:border-blue-500/40 transition-all">
              <CardContent className="pt-4 text-xs text-slate-200 leading-relaxed">
                {s}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-xs text-slate-500">No mentorship opportunities generated.</p>
        )}
      </div>

      {/* 3. Collaboration & Events */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-base font-headline font-bold text-white">
            Conferences & Hackathons
          </h2>
        </div>
        {suggestions.collaborationEvents.length > 0 ? (
          suggestions.collaborationEvents.map((s, i) => (
            <Card key={`evt-${i}`} className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-all">
              <CardContent className="pt-4 text-xs text-slate-200 leading-relaxed">
                {s}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-xs text-slate-500">No events found.</p>
        )}
      </div>
    </motion.div>
  );
}

export default function NetworkingPage() {
  const [goals, setGoals] = useState('');
  const [suggestions, setSuggestions] =
    useState<NetworkingSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const userProfile =
    'Aspiring Software Engineer with solid foundation in Data Structures, Algorithms, React, and Backend systems, actively preparing for campus and off-campus placements.';

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event: any) => {
        toast({
          title: 'Speech recognition error',
          description: event.error,
          variant: 'destructive',
        });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setGoals((prev) => prev + finalTranscript + ' ');
        }
      };
    }

    return () => recognitionRef.current?.stop();
  }, [toast]);

  const speak = async (text: string) => {
    try {
      const { audio } = await textToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = audio;
        audioRef.current.play();
      }
    } catch (error) {
      // Audio speech output is optional
    }
  };

  const handleGetSuggestions = async (customGoals?: string) => {
    const text = (customGoals || goals).trim();
    if (!text) {
      toast({
        title: 'Networking goals required',
        description: 'Please describe your networking or career mentorship goals.',
        variant: 'destructive',
      });
      return;
    }

    if (mentorCache.has(text)) {
      setSuggestions(mentorCache.get(text)!);
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    try {
      const result = await provideAiNetworkingSuggestions({
        userProfile,
        networkingGoals: text,
      });
      mentorCache.set(text, result);
      setSuggestions(result);

      let speech = 'Here are your AI networking suggestions. ';
      if (result.networkingSuggestions.length > 0) {
        speech += 'For networking: ' + result.networkingSuggestions.join('. ') + '. ';
      }
      speak(speech);
    } catch (error) {
      toast({
        title: 'Error generating suggestions',
        description: 'Could not connect to AI advisor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Speech recognition not supported',
        description: 'Your browser does not support Web Speech recognition.',
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
    <div className="w-full space-y-8">
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              AI Career Mentor &amp; Networking Strategy
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              Executive Guidance
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Discover senior engineering mentors, warm referral outreach strategies, and high-impact tech events.
          </p>
        </div>
      </div>

      {/* Input Console */}
      <Card className="glass-card border-violet-500/20">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Describe Your Current Career &amp; Mentorship Aspirations
              </label>
              <span className="text-[11px] text-violet-400 font-mono">Voice Dictation Enabled</span>
            </div>
            <Textarea
              name="goals"
              placeholder="e.g., I want to connect with senior engineers at tier-1 product companies for backend referrals, contribute to an open-source Kubernetes tool, and find a mentor in System Design..."
              className="min-h-[120px] bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 resize-none focus:border-violet-500/50"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          {/* Quick template chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {quickGoalTemplates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGoals(template);
                  handleGetSuggestions(template);
                }}
                className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-950/20 transition-all text-left"
              >
                + {template}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              disabled={isLoading}
              className={cn(
                'h-9 px-3 rounded-lg text-xs transition-all',
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'border-white/10 text-slate-300 hover:text-white'
              )}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 mr-1.5" /> : <Mic className="w-3.5 h-3.5 mr-1.5 text-violet-400" />}
              {isRecording ? 'Listening...' : 'Speak Goals'}
            </Button>

            <Button
              onClick={() => handleGetSuggestions()}
              disabled={isLoading || !goals.trim()}
              className="h-9 px-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-violet-500/20"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Strategic Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading state skeleton */}
      {isLoading && !suggestions && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              <div className="h-6 w-32 bg-white/[0.05] rounded-md" />
              <div className="h-28 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
              <div className="h-28 rounded-xl bg-white/[0.03] border border-white/[0.06]" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {suggestions && <NetworkingSuggestions suggestions={suggestions} />}
    </div>
  );
}
