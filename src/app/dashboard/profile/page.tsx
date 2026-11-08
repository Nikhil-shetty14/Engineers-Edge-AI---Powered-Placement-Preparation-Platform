'use client';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemo, useEffect } from 'react';
import { Loader2, User, ShieldCheck, Mail, Linkedin, Github, Save, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  linkedInProfile: z.string().url().optional().or(z.literal('')),
  gitHubProfile: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading } = useDoc<ProfileFormValues>(userProfileRef);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      linkedInProfile: '',
      gitHubProfile: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset(userProfile);
    }
  }, [userProfile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;
    const profileRef = doc(firestore, 'users', user.uid);
    setDocumentNonBlocking(profileRef, { ...data, id: user.uid }, { merge: true });
    toast({
      title: 'Profile Updated Successfully',
      description: 'Your changes have been synced across your career record.',
    });
    reset(data);
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : 'U';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white tracking-tight">
              Candidate Profile &amp; Settings
            </h1>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 font-mono text-xs">
              Verified Candidate
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Manage your personal details, placement targets, and external portfolio links.
          </p>
        </div>
      </div>

      {/* Account Overview Card */}
      <div className="p-6 rounded-2xl glass-card border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-violet-500/40 shadow-lg shadow-violet-500/20">
            <AvatarImage src={user?.photoURL ?? undefined} alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {user?.displayName || 'Software Engineer'}
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
                Placement Tier: Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs font-mono text-slate-400">Account ID</span>
          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px]">
            {user?.uid}
          </span>
        </div>
      </div>

      {/* Profile Form Card */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-4 border-b border-white/[0.08]">
          <CardTitle className="text-base font-headline font-semibold text-white">
            Professional Information
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Used by the AI Resume Builder and Interview Simulator to customize recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-mono text-slate-300">
                    First Name
                  </Label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="firstName"
                        {...field}
                        className="bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 focus:border-violet-500/50"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-mono text-slate-300">
                    Last Name
                  </Label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="lastName"
                        {...field}
                        className="bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 focus:border-violet-500/50"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono text-slate-300">
                  Email Address (Primary Login)
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      {...field}
                      disabled
                      className="bg-slate-900/40 border-white/5 text-xs text-slate-500 cursor-not-allowed"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedInProfile" className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
                  </Label>
                  <Controller
                    name="linkedInProfile"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="linkedInProfile"
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                        className="bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 focus:border-violet-500/50"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gitHubProfile" className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-200" /> GitHub Profile URL
                  </Label>
                  <Controller
                    name="gitHubProfile"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="gitHubProfile"
                        placeholder="https://github.com/username"
                        {...field}
                        className="bg-[#090D1A]/60 border-white/10 text-xs text-slate-200 focus:border-violet-500/50"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.08]">
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs px-6 shadow-md shadow-violet-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
