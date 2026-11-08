'use client';

import React, { memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Code2,
  Bot,
  Users,
  Compass,
  CheckSquare,
  Trophy,
  FolderGit2,
  Briefcase,
  Settings,
  Sparkles,
  Zap,
  X,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useUser } from '@/firebase';
import { usePlacementStats } from '@/hooks/use-placement-stats';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    title: 'AI INTELLIGENCE',
    items: [
      {
        href: '/dashboard/coding-assistant',
        icon: Code2,
        label: 'DSA & Coding AI',
        badge: 'Live',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      },
      {
        href: '/dashboard/interview',
        icon: Bot,
        label: 'Interview Simulator',
      },
      {
        href: '/dashboard/resume',
        icon: Sparkles,
        label: 'Resume AI Assistant',
      },
      {
        href: '/dashboard/networking',
        icon: Users,
        label: 'AI Career Mentor',
      },
    ],
  },
  {
    title: 'PLACEMENT ACCELERATOR',
    items: [
      {
        href: '/dashboard/aptitude',
        icon: CheckSquare,
        label: 'Aptitude Prep',
      },
      {
        href: '/dashboard/courses',
        icon: Compass,
        label: 'Learning Roadmap',
      },
      {
        href: '/dashboard/quiz',
        icon: Trophy,
        label: 'Tech Quizzes',
      },
      {
        href: '/dashboard/projects',
        icon: FolderGit2,
        label: 'AI Project Ideas',
      },
      {
        href: '/dashboard/jobs',
        icon: Briefcase,
        label: 'Job Matcher',
      },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      {
        href: '/dashboard/profile',
        icon: Settings,
        label: 'Profile & Settings',
      },
    ],
  },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const stats = usePlacementStats(user);

  const isItemActive = useCallback(
    (href: string, exact?: boolean) => {
      if (exact) {
        return pathname === href;
      }
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  const handleLinkClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const handlePrefetch = useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        // ignore prefetch errors
      }
    },
    [router]
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col',
          'bg-[#090D1A]/95 lg:bg-[#090D1A]/90 backdrop-blur-xl',
          'border-r border-white/[0.08]',
          'transition-transform duration-200 ease-out will-change-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.08]">
          <Link
            href="/dashboard"
            prefetch={true}
            onMouseEnter={() => handlePrefetch('/dashboard')}
            className="group flex items-center gap-2.5 font-semibold text-foreground tracking-tight"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full rounded-[11px] bg-[#090D1A] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.jpg"
                  width={24}
                  height={24}
                  alt="Logo"
                  priority
                  className="rounded-sm object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Engineers Edge
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30 font-medium">
                  AI
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Career OS v2.0</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/60 uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const active = isItemActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => handlePrefetch(item.href)}
                    onTouchStart={() => handlePrefetch(item.href)}
                    onClick={handleLinkClick}
                    className={cn(
                      'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white font-semibold border border-violet-500/30 shadow-sm shadow-violet-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'ml-auto text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full border',
                          item.badgeColor
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Readiness Score Card */}
        <div className="p-3 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#11182B] to-[#162038] border border-violet-500/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-violet-400" />
                Placement Readiness
              </span>
              <span className="text-xs font-bold font-mono text-violet-300">{stats.readinessScore}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.readinessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center justify-between">
              <span>Target: SDE Tier-1</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Live
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
