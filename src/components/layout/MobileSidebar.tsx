'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  User,
  BrainCircuit,
  ClipboardCheck,
  LayoutList,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { SheetClose } from '../ui/sheet';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Job Matching' },
  { href: '/dashboard/resume', icon: FileText, label: 'Resume Builder' },
  { href: '/dashboard/interview', icon: MessageSquare, label: 'Interview Sim' },
  { href: '/dashboard/networking', icon: Users, label: 'Networking' },
  { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Tech Quiz' },
  { href: '/dashboard/aptitude', icon: ClipboardCheck, label: 'Aptitude Test' },
  { href: '/dashboard/projects', icon: LayoutList, label: 'Project Suggestions' },
  { href: '/dashboard/coding-assistant', icon: Terminal, label: 'AI Coding Assistant' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function MobileSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-4">
      <Link
        href="/dashboard"
        className="group flex h-9 shrink-0 items-center gap-2 rounded-full text-lg font-semibold text-primary-foreground md:text-base mb-4"
      >
        <Image
          src="/logo.jpg"
          width={32}
          height={32}
          alt="Logo"
          className="transition-all group-hover:scale-110"
        />
        <span className="font-headline text-xl text-foreground">
          Engineers Edge AI
        </span>
      </Link>
      <nav className="flex-1">
        {navItems.map((item) => (
          <SheetClose asChild key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent/50 hover:text-foreground',
                (pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))) &&
                  'bg-primary/10 text-primary hover:text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </SheetClose>
        ))}
      </nav>
    </div>
  );
}
