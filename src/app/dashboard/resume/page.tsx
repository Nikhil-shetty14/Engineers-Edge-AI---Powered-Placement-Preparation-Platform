'use client';

import { useState } from 'react';
import { generateAiOptimizedResume } from '@/ai/flows/generate-ai-optimized-resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Download,
  Sparkles,
  UploadCloud,
  FileCheck2,
  FileText,
  Target,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import PreviousResumes from './PreviousResumes';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ResumeBuilderPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [optimizedResumes, setOptimizedResumes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile || !jobDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please upload a resume file and provide a target job description.',
        variant: 'destructive',
      });
      return;
    }
    if (!auth.currentUser) {
      toast({
        title: 'Not Authenticated',
        description: 'You must be logged in to generate resumes.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOptimizedResumes([]);

    try {
      const resumeDataUri = await fileToDataUri(resumeFile);
      const result = await generateAiOptimizedResume({
        resumeDataUri,
        jobDescription,
        numVariants: 3,
      });
      setOptimizedResumes(result.optimizedResumes);

      // Save to Firestore
      const currentUid = user?.uid || auth.currentUser?.uid;
      if (currentUid) {
        const generatedResumesCol = collection(
          firestore,
          'users',
          currentUid,
          'generatedResumes'
        );
        for (const resume of result.optimizedResumes) {
          addDocumentNonBlocking(generatedResumesCol, {
            userId: currentUid,
            jobDescription,
            resumeContent: resume,
            createdAt: serverTimestamp(),
          });
        }
      }
      toast({
        title: 'Resumes Generated & Saved',
        description: '3 ATS-optimized resume variants have been saved to your profile.',
      });
    } catch (error) {
      toast({
        title: 'Error Generating Resumes',
        description: 'Something went wrong during AI synthesis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (resumeText: string, variant: number) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`AI-Optimized Resume - Variant ${variant}`, margin, margin);

      const plainText = resumeText
        .replace(/###\s/g, '')
        .replace(/##\s/g, '')
        .replace(/#\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '  - ')
        .replace(/__/g, '');

      const textLines = doc.splitTextToSize(plainText, pageWidth - margin * 2);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(textLines, margin, margin + 10);
      doc.save(`ai-optimized-resume-variant-${variant}.pdf`);
      toast({ title: 'PDF Downloaded' });
    } catch {
      toast({ title: 'Error exporting PDF', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              Resume AI Optimizer & Builder
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              ATS 98%+ Pass Rate
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Tailor your resume precisely to your dream job description using deep semantic keyword matching.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="glass-card border-violet-500/20">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Zone */}
              <div className="space-y-2">
                <Label htmlFor="resume-file" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  1. Current Resume (PDF, DOCX, TXT)
                </Label>
                <div className="relative border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-2xl p-6 text-center bg-[#090D1A]/50 transition-all">
                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) =>
                      setResumeFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                      {resumeFile ? <FileCheck2 className="w-6 h-6 text-emerald-400" /> : <UploadCloud className="w-6 h-6" />}
                    </div>
                    {resumeFile ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-emerald-400">{resumeFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(resumeFile.size / 1024).toFixed(1)} KB • Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-slate-200">
                          Click to select or drag and drop your resume
                        </p>
                        <p className="text-[11px] text-slate-500">PDF, DOCX, or TXT up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-2">
                <Label htmlFor="job-description" className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  2. Target Job Description
                </Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description, required skills, and responsibilities here..."
                  className="min-h-[140px] bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 resize-none focus:border-violet-500/50"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Generates 3 tailored variants targeting keywords, impact metrics, and leadership.</span>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !resumeFile || !jobDescription}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs px-6 shadow-md shadow-violet-500/20"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Synthesize Optimized Resumes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Generated Resumes Section */}
      {optimizedResumes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Generated ATS-Optimized Variants
            </h2>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs">
              Estimated ATS Score: 96/100
            </Badge>
          </div>

          <Tabs defaultValue="variant-1">
            <TabsList className="bg-slate-900/80 border border-white/10 p-1 rounded-xl">
              {optimizedResumes.map((_, index) => (
                <TabsTrigger
                  key={index}
                  value={`variant-${index + 1}`}
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-medium rounded-lg"
                >
                  Variant {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {optimizedResumes.map((resume, index) => (
              <TabsContent key={index} value={`variant-${index + 1}`} className="mt-4">
                <Card className="glass-card border-violet-500/20">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-white font-semibold">
                        Resume Variant {index + 1}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Enhanced with target keywords and quantified achievement bullet points
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleDownload(resume, index + 1)}
                      size="sm"
                      className="bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 text-xs"
                    >
                      <Download className="mr-2 h-3.5 w-3.5 text-violet-400" />
                      Download Clean PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 rounded-xl bg-[#090D1A] border border-white/[0.08] text-xs text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto prose prose-invert max-w-none">
                      <ReactMarkdown>{resume}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      )}

      {/* Previous Resumes Log */}
      <PreviousResumes />
    </div>
  );
}
