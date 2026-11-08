'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/layout/sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import { PlacementStatsProvider } from '@/hooks/use-placement-stats';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Sync session cookie non-blockingly only once per token
    user.getIdToken().then((idToken) => {
      if (syncedTokenRef.current === idToken) return;
      syncedTokenRef.current = idToken;

      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }).catch(() => {
        // Non-fatal if session cookie fails in dev/offline
      });
    }).catch(() => {});
  }, [user, isUserLoading, router]);

  // Zero-CLS skeleton while checking initial auth status
  if (isUserLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090D1A] text-foreground relative">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-[140px]" />
        </div>

        {/* Sidebar skeleton placeholder */}
        <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 flex-col bg-[#090D1A]/90 border-r border-white/[0.08] p-4 space-y-4">
          <div className="h-10 w-44 rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="space-y-2 pt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </aside>

        <div className="min-h-screen lg:pl-64 flex flex-col">
          <div className="h-16 border-b border-white/[0.08] px-6 flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
          <main className="flex-1 pt-8 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <div className="h-44 w-full rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PlacementStatsProvider user={user}>
      <div className="min-h-screen w-full bg-[#090D1A] text-foreground relative selection:bg-violet-500/30 selection:text-white">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full bg-violet-800/5 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="min-h-screen lg:pl-64 flex flex-col transition-all duration-200">
          <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 pt-16 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </PlacementStatsProvider>
  );
}
