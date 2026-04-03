'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import {
  Home,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Sparkles,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] mesh-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl gradient-bg animate-pulse" />
          <div className="h-1 w-24 rounded-full bg-[var(--border)] overflow-hidden">
            <div className="h-full w-1/2 rounded-full gradient-bg animate-[shimmer_1s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] mesh-gradient">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-[var(--surface)] border-r border-[var(--border)]">
        <div className="flex flex-col h-full p-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">chilav</span>
          </div>

          {/* Quick action */}
          <button
            onClick={() => router.push('/expenses')}
            className="flex items-center gap-3 w-full px-4 py-3 mb-6 rounded-2xl gradient-bg text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[var(--primary)]/20"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--primary)]/8 text-[var(--primary)] font-semibold"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between px-1">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center h-9 w-9 rounded-xl text-[var(--muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* User card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-hover)]">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getUserInitials(user.email || 'U')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border)] safe-area-pb">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)]"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="text-base font-black text-foreground">chilav</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-xs">
              {getUserInitials(user.email || 'U')}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[260px] flex flex-col w-full">
        {/* Page header area - Desktop */}
        <div className="hidden lg:block px-8 pt-8 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {getGreeting()}, {user.email?.split('@')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-5 lg:px-8 pt-20 lg:pt-2 pb-24 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
