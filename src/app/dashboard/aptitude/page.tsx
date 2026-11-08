'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  Binary,
  BarChart3,
  BookOpen,
  PieChart,
  Brain,
  Timer,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AptitudeTestClient from './AptitudeTestClient';
import PastAptitudeTests from './PastAptitudeTests';
import { motion } from 'framer-motion';

const topics = [
  {
    name: 'Logical Reasoning',
    description: 'Blood relations, direction sense, syllogisms, and sequence deduction.',
    icon: Lightbulb,
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/20 hover:border-violet-500/40',
    bgGlow: 'bg-violet-600/10',
    difficulty: 'Moderate',
    questions: 10,
    duration: '10 Mins',
  },
  {
    name: 'Numerical & Quantitative Ability',
    description: 'Percentages, ratios, time & work, permutations & combinations, probability.',
    icon: BarChart3,
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    bgGlow: 'bg-blue-600/10',
    difficulty: 'High Impact',
    questions: 10,
    duration: '10 Mins',
  },
  {
    name: 'Verbal Ability & Comprehension',
    description: 'Sentence completion, vocabulary in context, grammar correction, reading analysis.',
    icon: BookOpen,
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    bgGlow: 'bg-cyan-600/10',
    difficulty: 'Standard',
    questions: 10,
    duration: '8 Mins',
  },
  {
    name: 'Data Interpretation & Analytics',
    description: 'Charts, tabular data analysis, pattern recognition, and mathematical deduction.',
    icon: PieChart,
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    bgGlow: 'bg-emerald-600/10',
    difficulty: 'Analytical',
    questions: 10,
    duration: '12 Mins',
  },
];

export default function AptitudeTestPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  if (selectedTopic) {
    return (
      <AptitudeTestClient
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              Aptitude & Cognitive Prep
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              AI Powered
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Master campus recruitment and MNC screening rounds with dynamic AI-generated cognitive evaluations.
          </p>
        </div>
      </div>

      {/* Category Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <div
                onClick={() => setSelectedTopic(topic.name)}
                className={`p-5 rounded-2xl glass-card border ${topic.borderColor} cursor-pointer group hover:-translate-y-1 transition-all duration-200 relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${topic.bgGlow} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 group-hover:border-violet-500/30 transition-all">
                      <Icon className={`w-6 h-6 ${topic.accentColor}`} />
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-white/[0.05] text-slate-300">
                      {topic.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                      {topic.name}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-slate-500" /> {topic.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-slate-500" /> {topic.questions} Questions
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Past attempts log */}
      <PastAptitudeTests />
    </div>
  );
}
