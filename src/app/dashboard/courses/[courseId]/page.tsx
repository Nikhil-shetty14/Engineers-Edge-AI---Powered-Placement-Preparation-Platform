'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Video, FileText, ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { placementCourses } from '@/lib/course-data';

interface Lesson {
  title: string;
  type: 'video' | 'text';
  content: string;
}

interface Course {
  title: string;
  description: string;
  category: string;
  lessons: Lesson[];
}

function LessonIcon({ type }: { type: 'video' | 'text' }) {
  if (type === 'video') {
    return (
      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
        <Video className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
      <FileText className="h-4 w-4" />
    </div>
  );
}

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const firestore = useFirestore();

  const fallbackCourse = useMemo(() => {
    if (typeof courseId !== 'string') return null;
    const slugs = ['dsa-js', 'system-design', 'react-state', 'sql-ds', 'behavioral-prep'];
    const slugIndex = slugs.indexOf(courseId);
    if (slugIndex !== -1 && placementCourses[slugIndex]) {
      return placementCourses[slugIndex] as Course;
    }
    return (placementCourses.find((c) =>
      c.title.toLowerCase().includes(courseId.toLowerCase())
    ) || placementCourses[0]) as Course;
  }, [courseId]);

  const courseRef = useMemoFirebase(() => {
    if (typeof courseId !== 'string') return null;
    return doc(firestore, 'courses', courseId);
  }, [firestore, courseId]);

  const { data: remoteCourse, isLoading } = useDoc<Course>(courseRef);
  const course = remoteCourse || fallbackCourse;

  if (isLoading && !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-400">Course module not found or unavailable.</p>
        <Button asChild variant="outline" size="sm" className="border-white/10 text-white">
          <Link href="/dashboard/courses">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Curriculum
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-white -ml-2"
      >
        <Link href="/dashboard/courses" prefetch={true}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Curriculum
        </Link>
      </Button>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border-violet-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              {course.category}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              {course.lessons?.length || 0} Comprehensive Modules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      {/* Curriculum Syllabus */}
      <Card className="glass-card border-white/10">
        <CardHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Interactive Lesson Curriculum
            </CardTitle>
            <span className="text-xs font-mono text-violet-400">Track Progress: 0%</span>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Complete each module sequentially to solidify core principles and system fundamentals.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {course.lessons?.map((lesson, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/[0.06] rounded-xl px-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-3.5">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-xs font-medium">
                      {index + 1}
                    </span>
                    <LessonIcon type={lesson.type} />
                    <span className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                      {lesson.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] mt-2">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/[0.04] space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="uppercase tracking-wider text-violet-400 font-semibold">
                        Format: {lesson.type} module
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready to review
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans">{lesson.content}</p>
                    <div className="pt-2 flex justify-end">
                      <Button size="sm" className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-medium">
                        <Play className="w-3 h-3 mr-1.5 fill-current" /> Launch Lesson Workspace
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
