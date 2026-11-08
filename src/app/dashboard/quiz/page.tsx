'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Database, Brain, Cpu, Globe, Terminal, ArrowRight, Trophy } from 'lucide-react';
import QuizClient from './QuizClient';
import PastQuizzes from './PastQuizzes';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const topics = [
  {
    name: 'Python',
    description: 'Generators, decorators, memory management, and asynchronous I/O.',
    icon: Terminal,
    color: 'text-violet-400',
    borderColor: 'border-violet-500/20 hover:border-violet-500/40',
    glow: 'bg-violet-600/10',
    badge: 'Popular',
  },
  {
    name: 'C / C++',
    description: 'Pointers, manual memory allocation, STL containers, and low-level optimization.',
    icon: Cpu,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    glow: 'bg-blue-600/10',
    badge: 'High Frequency',
  },
  {
    name: 'React & Frontend',
    description: 'React 18/19 concurrency, Server Components, memoization, and performance rendering.',
    icon: Code2,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
    glow: 'bg-cyan-600/10',
    badge: 'Trending',
  },
  {
    name: 'SQL & Database Internals',
    description: 'ACID properties, B-Tree indexes, isolation levels, query execution plans.',
    icon: Database,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    glow: 'bg-emerald-600/10',
    badge: 'Essential',
  },
  {
    name: 'System Design Architecture',
    description: 'Distributed caches, message brokers (Kafka), rate limiters, CAP theorem.',
    icon: Brain,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    glow: 'bg-amber-600/10',
    badge: 'SDE-1/2',
  },
  {
    name: 'Computer Networks',
    description: 'TCP 3-way handshake, TLS 1.3, HTTP/2 & HTTP/3, DNS routing, and socket IPC.',
    icon: Globe,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/20 hover:border-rose-500/40',
    glow: 'bg-rose-600/10',
    badge: 'Core CS',
  },
];

export default function QuizPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  if (selectedTopic) {
    return (
      <QuizClient
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
              Technical Skill Quizzes
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              Live Evaluation
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Rapid-fire MCQs generated on the fly to test syntax, internal mechanics, and edge cases.
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                onClick={() => setSelectedTopic(topic.name)}
                className={`p-5 rounded-2xl glass-card border ${topic.borderColor} cursor-pointer group hover:-translate-y-1 transition-all duration-200 relative overflow-hidden h-full flex flex-col justify-between`}
              >
                <div className={`absolute top-0 right-0 w-28 h-28 ${topic.glow} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 group-hover:border-violet-500/30 transition-all">
                      <Icon className={`w-5 h-5 ${topic.color}`} />
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-white/[0.05] text-slate-300">
                      {topic.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
                      {topic.name}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-violet-400" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/[0.06] mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>5 Questions</span>
                  <span className="text-violet-400 font-medium">Start Quiz →</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <PastQuizzes />
    </div>
  );
}
