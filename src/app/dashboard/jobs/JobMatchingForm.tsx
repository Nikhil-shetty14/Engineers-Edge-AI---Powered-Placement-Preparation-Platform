'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sampleProfiles = [
  'Full-stack engineer with React, Next.js, Node.js, and PostgreSQL. Built high-scale SaaS with 50K users.',
  'Backend developer specializing in Distributed Systems, Go, Kubernetes, Redis, and Kafka messaging.',
  'Frontend engineer proficient in TypeScript, React, Tailwind CSS, performance profiling, and UI design systems.',
];

export function JobMatchingForm({ profile }: { profile: string }) {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProfile = formData.get('profile') as string;
    router.push(`/dashboard/jobs?profile=${encodeURIComponent(newProfile)}`);
  };

  const setSample = (text: string) => {
    const input = document.getElementById('profile-input') as HTMLTextAreaElement;
    if (input) {
      input.value = text;
      router.push(`/dashboard/jobs?profile=${encodeURIComponent(text)}`);
    }
  };

  return (
    <Card className="glass-card border-violet-500/20">
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              Paste Resume Summary, Skills, or LinkedIn Bio
            </label>
            <Textarea
              id="profile-input"
              name="profile"
              placeholder="e.g., Software Engineer with 2 years experience in React, Python, PostgreSQL, System Design, and Docker..."
              className="min-h-[140px] bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 resize-none focus:border-violet-500/50"
              defaultValue={profile}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {sampleProfiles.map((sample, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setSample(sample)}
                className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-950/20 transition-all text-left"
              >
                + Preset: {sample.substring(0, 45)}...
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Analyzes job market demand and computes relevance scores
            </span>
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs px-6 shadow-md shadow-violet-500/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Opportunities
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
