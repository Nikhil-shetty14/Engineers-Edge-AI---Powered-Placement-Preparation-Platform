'use client';

import { useMemoFirebase, useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, History, FileText } from 'lucide-react';

interface GeneratedResume {
  jobDescription: string;
  resumeContent: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function PreviousResumes() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const currentUid = user?.uid || auth.currentUser?.uid;

  const resumesQuery = useMemoFirebase(() => {
    if (!currentUid) return null;
    return query(
      collection(firestore, 'users', currentUid, 'generatedResumes'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [currentUid, firestore]);

  const { data: resumes, isLoading } = useCollection<GeneratedResume>(resumesQuery);

  return (
    <div className="pt-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-headline font-semibold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-violet-400" />
            Resume Optimization Archive
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Previously generated tailored resumes and targeted job specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
          )}
          {!isLoading && (!resumes || resumes.length === 0) && (
            <p className="text-slate-400 text-center py-6 text-xs">
              No previous resume variants saved yet.
            </p>
          )}
          {!isLoading && resumes && resumes.length > 0 && (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {resumes.map((resume: WithId<GeneratedResume>) => (
                <AccordionItem
                  key={resume.id}
                  value={resume.id}
                  className="border border-white/[0.08] rounded-xl px-4 bg-white/[0.02] overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                      <span className="truncate text-xs font-medium text-white max-w-md flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        Target: {resume.jobDescription.substring(0, 60)}...
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {resume.createdAt?.seconds
                          ? formatDistanceToNow(new Date(resume.createdAt.seconds * 1000), {
                              addSuffix: true,
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="p-4 rounded-xl bg-[#090D1A] border border-white/[0.08] text-xs text-slate-200 leading-relaxed max-h-[400px] overflow-y-auto prose prose-invert max-w-none">
                      <ReactMarkdown>{resume.resumeContent}</ReactMarkdown>
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
