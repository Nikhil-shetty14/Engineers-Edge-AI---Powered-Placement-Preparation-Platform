'use client';

import { useMemoFirebase, useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, History, FolderGit2 } from 'lucide-react';
import type { SuggestProjectsOutput } from '@/ai/flows/suggest-projects';
import { Badge } from '@/components/ui/badge';

type ProjectSuggestion = SuggestProjectsOutput['projects'][0] & {
  originalPrompt: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export default function PastProjectSuggestions() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const currentUid = user?.uid || auth.currentUser?.uid;

  const suggestionsQuery = useMemoFirebase(() => {
    if (!currentUid) return null;
    return query(
      collection(firestore, 'users', currentUid, 'projectSuggestions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [currentUid, firestore]);

  const { data: suggestions, isLoading } = useCollection<ProjectSuggestion>(suggestionsQuery);

  return (
    <div className="pt-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-headline font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-violet-400" />
            Saved Project Blueprints
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Archive of your generated system designs and architectural plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          )}
          {!isLoading && (!suggestions || suggestions.length === 0) && (
            <p className="text-slate-400 text-center py-6 text-xs">
              No previous projects architected yet.
            </p>
          )}
          {!isLoading && suggestions && suggestions.length > 0 && (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {suggestions.map((suggestion: WithId<ProjectSuggestion>) => (
                <AccordionItem
                  key={suggestion.id}
                  value={suggestion.id}
                  className="border border-white/[0.08] rounded-xl px-4 bg-white/[0.02] overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                      <span className="truncate text-xs font-semibold text-white max-w-md flex items-center gap-2">
                        <FolderGit2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        {suggestion.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {suggestion.createdAt?.seconds
                          ? formatDistanceToNow(new Date(suggestion.createdAt.seconds * 1000), {
                              addSuffix: true,
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {suggestion.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {suggestion.techStack?.map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-slate-900 border border-white/10 text-[10px] font-mono text-violet-300"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
