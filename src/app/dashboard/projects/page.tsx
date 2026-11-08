'use client';

import { useState } from 'react';
import { suggestProjects, type SuggestProjectsOutput } from '@/ai/flows/suggest-projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Sparkles, FolderGit2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import PastProjectSuggestions from './PastProjectSuggestions';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const promptTemplates = [
  'Distributed Key-Value Store with Raft consensus in Go',
  'Real-Time Collaborative Code Editor with WebSockets & Operational Transforms',
  'Microservices E-Commerce Platform with Event Sourcing & Kafka',
  'High-Throughput URL Shortener with Redis Caching & Rate Limiting',
];

const projectCache = new Map<string, SuggestProjectsOutput['projects']>();

export default function ProjectSuggestionsPage() {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestProjectsOutput['projects']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleGenerateSuggestions = async (customPrompt?: string) => {
    const queryText = (customPrompt || prompt).trim();
    if (!queryText) {
      toast({
        title: 'Project prompt is empty',
        description: 'Please describe the domain or architecture you want to explore.',
        variant: 'destructive',
      });
      return;
    }
    if (!auth.currentUser) {
      toast({ title: 'Not Authenticated', variant: 'destructive' });
      return;
    }

    if (projectCache.has(queryText)) {
      setSuggestions(projectCache.get(queryText)!);
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const result = await suggestProjects({ prompt: queryText });
      projectCache.set(queryText, result.projects);
      setSuggestions(result.projects);

      const currentUid = user?.uid || auth.currentUser?.uid;
      if (currentUid) {
        const suggestionsCol = collection(
          firestore,
          'users',
          currentUid,
          'projectSuggestions'
        );
        for (const project of result.projects) {
          addDocumentNonBlocking(suggestionsCol, {
            userId: currentUid,
            originalPrompt: queryText,
            title: project.title,
            description: project.description,
            features: project.features,
            techStack: project.techStack,
            createdAt: serverTimestamp(),
          });
        }
      }

      toast({
        title: 'Projects Architected!',
        description: 'New production-ready project blueprints have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error Generating Suggestions',
        description: 'Could not connect to AI architect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              Resume-Worthy AI Project Architect
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              Portfolio Tier-1
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Generate standout system architectures and full-stack projects that get recruiters' attention in SDE rounds.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="glass-card border-violet-500/20">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-prompt" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              Project Concept or Target Domain
            </Label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                id="project-prompt"
                placeholder="e.g., a real-time distributed chat application with Redis pub/sub..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateSuggestions();
                }}
                className="bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 focus:border-violet-500/50 h-11"
              />
              <Button
                onClick={() => handleGenerateSuggestions()}
                disabled={isLoading}
                className="h-11 px-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-violet-500/20 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Architect Projects
              </Button>
            </div>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {promptTemplates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(template);
                  handleGenerateSuggestions(template);
                }}
                className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-950/20 transition-all text-left"
              >
                + {template}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl glass-card space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-xs font-mono text-slate-400">
            Synthesizing production blueprints, database schemas, and feature lists...
          </p>
        </div>
      )}

      {/* Results */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Generated Project Blueprints
            </h2>
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 font-mono text-xs">
              {suggestions.length} Architectures Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((project, index) => (
              <Card key={index} className="glass-card border-violet-500/20 flex flex-col justify-between hover:border-violet-500/40 transition-all">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-white">
                      {project.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-slate-400 shrink-0">
                      Portfolio Grade
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-300 leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Core Engineering Features:
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Recommended Tech Stack:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-slate-900 border border-white/10 text-[10px] font-mono text-violet-300"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <PastProjectSuggestions />
    </div>
  );
}
