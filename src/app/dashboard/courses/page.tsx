'use client';

import { useMemo, useState, useCallback } from 'react';
import { useMemoFirebase } from '@/firebase';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Loader2, BookOpen, PlusCircle, ArrowRight, Layers, Compass } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { seedCourses } from '@/lib/seed-courses';
import { placementCourses } from '@/lib/course-data';
import { useToast } from '@/hooks/use-toast';

interface Course {
  title: string;
  description: string;
  category: string;
}

const fallbackCourses: WithId<Course>[] = placementCourses.map((c, index) => ({
  id: ['dsa-js', 'system-design', 'react-state', 'sql-ds', 'behavioral-prep'][index] || `course-${index + 1}`,
  title: c.title,
  description: c.description,
  category: c.category,
}));

function CourseCard({ course }: { course: WithId<Course> }) {
  return (
    <Link href={`/dashboard/courses/${course.id}`} prefetch={true}>
      <Card className="h-full glass-card border-white/10 hover:border-violet-500/40 transition-all hover:-translate-y-1 duration-150 group relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all" />

        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-[10px] border-violet-500/30 text-violet-300 bg-violet-500/10">
              {course.category}
            </Badge>
            <span className="text-[11px] font-mono text-slate-500">Curriculum</span>
          </div>
          <CardTitle className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/[0.06] pt-3">
            <span className="flex items-center gap-1.5 text-violet-400">
              <Layers className="w-3.5 h-3.5" /> Core Placement Module
            </span>
            <span className="text-white group-hover:translate-x-1 transition-transform flex items-center">
              Explore <ArrowRight className="w-3.5 h-3.5 ml-1 text-violet-400" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CoursesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const coursesQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'courses'));
  }, [firestore]);

  const { data: remoteCourses, isLoading, error, refetch } = useCollection<Course>(coursesQuery);

  const displayedCourses = useMemo(() => {
    if (remoteCourses && remoteCourses.length > 0) return remoteCourses;
    return fallbackCourses;
  }, [remoteCourses]);

  const handleSeedCourses = useCallback(async () => {
    setIsSeeding(true);
    try {
      await seedCourses(firestore);
      toast({
        title: 'Curriculum Seeded Successfully',
        description: 'CS Core, DSA, and System Design tracks loaded into the catalog.',
      });
      refetch();
    } catch {
      toast({
        title: 'Error Seeding Courses',
        description: 'Failed to populate default curriculum.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  }, [firestore, toast, refetch]);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              Learning Roadmap &amp; CS Curriculum
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              Placement Tracks
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Structured modules in Computer Networks, Data Structures, System Design, and Modern Web Architectures.
          </p>
        </div>

        <Button
          onClick={handleSeedCourses}
          disabled={isSeeding}
          variant="outline"
          size="sm"
          className="border-white/10 text-slate-300 hover:text-white text-xs h-9"
        >
          {isSeeding ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="mr-2 h-3.5 w-3.5 text-violet-400" />}
          Sync Database Tracks
        </Button>
      </div>

      {error && !remoteCourses && (
        <Alert variant="destructive" className="glass-card border-rose-500/30">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Using Local Curriculum Cache</AlertTitle>
          <AlertDescription>
            Showing cached curriculum modules while reconnecting to database.
          </AlertDescription>
        </Alert>
      )}

      {/* Instant course display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
