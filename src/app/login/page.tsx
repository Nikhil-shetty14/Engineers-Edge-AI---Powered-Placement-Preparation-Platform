'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FcGoogle } from 'react-icons/fc';
import { Sparkles, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function AuthForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const [firstName, ...lastNameParts] =
          user.displayName?.split(' ') || [];
        const lastName = lastNameParts.join(' ');
        await setDoc(userRef, {
          id: user.uid,
          firstName: firstName || '',
          lastName: lastName || '',
          email: user.email,
        });
      }

      toast({ title: 'Signed in successfully!' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-medium"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="mr-2.5 h-4 w-4" />
          Continue with Google
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono">
          <span className="bg-[#11182B] px-3 text-slate-500">
            Or continue with email
          </span>
        </div>
      </div>
    </>
  );
}

function LoginForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Signed in successfully!' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <AuthForm />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-mono text-slate-300">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@domain.com"
                    {...field}
                    className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-mono text-slate-300">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-violet-500/20"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {form.formState.isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>
      </Form>
    </>
  );
}

function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      });

      await sendEmailVerification(user);

      toast({
        title: 'Account created!',
        description: 'A verification email has been sent.',
      });
      router.push('/verify-email');
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <AuthForm />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-mono text-slate-300">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Nikhil" {...field} className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-mono text-slate-300">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sharma" {...field} className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-mono text-slate-300">Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@domain.com" {...field} className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-mono text-slate-300">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-mono text-slate-300">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="bg-[#090D1A]/60 border-white/10 text-xs text-white h-10" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-violet-500/20"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {form.formState.isSubmitting ? 'Creating Profile...' : 'Create Engineer Account'}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090D1A] relative selection:bg-violet-500/30 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Top Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 p-[1px] shadow-lg shadow-violet-500/25">
              <div className="w-full h-full rounded-[15px] bg-[#090D1A] flex items-center justify-center overflow-hidden">
                <Image src="/logo.jpg" width={26} height={26} alt="Logo" className="rounded-sm" />
              </div>
            </div>
            <span className="font-headline font-bold text-2xl text-white tracking-tight flex items-center gap-1.5">
              Engineers Edge
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                AI
              </span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Placement &amp; SDE Acceleration Platform
          </p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card border-violet-500/25 shadow-2xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-lg font-headline font-semibold text-white">
              Candidate Portal
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Sign in to resume practice tests, mock interviews, and DSA progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border border-white/10 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-medium rounded-lg"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-xs font-medium rounded-lg"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="pt-4">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="pt-4">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500 text-center">
          <Shield className="w-3.5 h-3.5 text-violet-400" />
          <span>Encrypted Session • Cloud Placement Records</span>
        </div>
      </div>
    </div>
  );
}
