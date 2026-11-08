'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ThemeToggle } from '../theme-toggle';
import { useUser, useAuth } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Menu,
  Sparkles,
  Zap,
  Activity,
  Bell,
  Code2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Placement Command Center',
  '/dashboard/coding-assistant': 'DSA & Coding Practice AI',
  '/dashboard/interview': 'AI Mock Interview Simulator',
  '/dashboard/resume': 'Resume AI Optimizer',
  '/dashboard/networking': 'AI Career Mentor & Networking',
  '/dashboard/aptitude': 'Aptitude & Cognitive Prep',
  '/dashboard/courses': 'Full-Stack & CS Learning Roadmap',
  '/dashboard/quiz': 'Live Technical Quizzes',
  '/dashboard/projects': 'Resume-Worthy Project Ideas',
  '/dashboard/jobs': 'Curated Placement Opportunities',
  '/dashboard/profile': 'User Profile & Settings',
};

function UserNav() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/session/signout', { method: 'POST' });
      toast({ title: 'Logged out successfully.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Failed to log out.', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium text-xs px-4 shadow-md shadow-violet-500/25 border-0"
      >
        <Link href="/login">Get Started</Link>
      </Button>
    );
  }

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email
    ? user.email[0].toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-2 ring-violet-500/30 hover:ring-violet-500 transition-all p-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL ?? undefined}
              alt={user.displayName ?? 'User avatar'}
            />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-elevated border-white/10 text-slate-200">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-white">
              {user.displayName || 'Engineer'}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-violet-600/20 focus:text-white">
          <Link href="/dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4 text-violet-400" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-violet-600/20 focus:text-white">
          <Link href="/dashboard/coding-assistant" className="flex items-center">
            <Code2 className="mr-2 h-4 w-4 text-blue-400" />
            <span>Coding AI</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-violet-600/20 focus:text-white">
          <Link href="/dashboard/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Profile & Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface TopNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function TopNavbar({ sidebarOpen, setSidebarOpen }: TopNavbarProps) {
  const { isUserLoading, user } = useUser();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  const currentTitle = routeTitles[pathname] || 'Placement Preparation';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 border-b border-white/[0.08] bg-[#090D1A]/85 backdrop-blur-xl transition-all duration-300',
        isDashboard ? 'left-0 lg:left-64' : 'left-0'
      )}
    >
      <div
        className={cn(
          'h-full px-4 sm:px-6 flex items-center justify-between gap-4',
          !isDashboard && 'max-w-7xl mx-auto'
        )}
      >
        {/* Left Section */}
        {isDashboard ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-300 hover:text-white hover:bg-white/[0.06]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">Engineers Edge</span>
                <span className="text-xs text-muted-foreground/60 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {currentTitle}
                </h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 p-[1px]">
                <div className="w-full h-full rounded-[11px] bg-[#090D1A] flex items-center justify-center overflow-hidden">
                  <Image src="/logo.jpg" width={22} height={22} alt="Logo" className="rounded-sm" />
                </div>
              </div>
              <span className="font-headline font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                Engineers Edge
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  AI
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Command Center
              </Link>
              <Link href="/dashboard/interview" className="hover:text-white transition-colors">
                Mock Interview
              </Link>
              <Link href="/dashboard/coding-assistant" className="hover:text-white transition-colors">
                Coding Assistant
              </Link>
              <Link href="/dashboard/courses" className="hover:text-white transition-colors">
                Curriculum
              </Link>
            </nav>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/20 text-xs text-violet-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Gemini 2.5 Active</span>
          </div>

          <ThemeToggle />

          {isUserLoading ? (
            <div className="h-9 w-9 rounded-full bg-white/[0.04] animate-pulse" />
          ) : (
            <UserNav />
          )}
        </div>
      </div>
    </header>
  );
}
