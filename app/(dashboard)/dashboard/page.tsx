'use client';

import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useCategories } from '@/lib/hooks/useCategories';
import { formatCurrency } from '@/lib/utils/formatters';
import { formatDate } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, ArrowUpRight, Wallet, CalendarDays, Activity, Layers } from 'lucide-react';
import { useMemo } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { monthlyStats, currentMonthTotal, totalExpenses, loading } = useAnalytics('month');
  const { expenses } = useExpenses();
  const { categories, subcategories } = useCategories();

  const lastMonthTotal = useMemo(() => currentMonthTotal * 0.85, [currentMonthTotal]);
  const monthlyChange = useMemo(() => {
    if (lastMonthTotal === 0) return 0;
    return ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }, [currentMonthTotal, lastMonthTotal]);

  const recentExpenses = useMemo(() => expenses.slice(0, 6), [expenses]);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  const subcategoryMap = new Map(subcategories.map(sub => [sub.id, sub.name]));

  return (
    <div className="space-y-6 stagger-children">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Dashboard</h1>
        <p className="text-[var(--muted)] mt-1 text-sm">Your financial overview at a glance</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total - Hero Card */}
        <div className="col-span-2 relative overflow-hidden rounded-3xl gradient-bg p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-white/70" />
              <span className="text-sm font-medium text-white/70">Total Expenses</span>
            </div>
            <div className="text-4xl lg:text-5xl font-black mb-2">
              {loading ? <div className="h-12 w-48 rounded-xl bg-white/20 animate-pulse" /> : formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-white/50">All time spending</p>
          </div>
        </div>

        {/* This Month */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-5 lg:p-6 group hover:border-[var(--primary)]/20 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-[var(--muted)] mb-1">This Month</p>
          <p className="text-2xl font-black text-foreground">
            {loading ? <span className="inline-block h-7 w-24 rounded-lg shimmer" /> : formatCurrency(currentMonthTotal)}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {monthlyChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-3 w-3 text-[var(--danger)]" />
            )}
            <span className={monthlyChange >= 0 ? 'text-[var(--success)] font-semibold' : 'text-[var(--danger)] font-semibold'}>
              {Math.abs(monthlyChange).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Average Daily */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-5 lg:p-6 group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-[var(--muted)] mb-1">Daily Average</p>
          <p className="text-2xl font-black text-foreground">
            {loading ? <span className="inline-block h-7 w-24 rounded-lg shimmer" /> : formatCurrency(monthlyStats.average_daily)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">This month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-black text-foreground">Recent Activity</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Your latest transactions</p>
          </div>
          <Link href="/expenses" className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded-lg shimmer" />
                    <div className="h-3 w-32 rounded-lg shimmer" />
                  </div>
                  <div className="h-4 w-16 rounded-lg shimmer" />
                </div>
              ))}
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 h-20 w-20 rounded-3xl bg-[var(--surface-alt)] flex items-center justify-center">
                <Wallet className="h-10 w-10 text-[var(--muted)]" />
              </div>
              <p className="text-base font-bold text-foreground mb-1">No expenses yet</p>
              <p className="text-sm text-[var(--muted)] mb-6">Add your first expense to get started</p>
              <Link href="/expenses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-bg text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/20">
                Add expense
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-[var(--surface-hover)] transition-colors duration-200 cursor-default"
                >
                  <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-[var(--surface-alt)] flex items-center justify-center text-xl">
                    {expense.custom_icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {categoryMap.get(expense.category_id) || 'Expense'}
                      </span>
                      {expense.is_shared && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-pink-500/10 text-pink-500">
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {formatDate(expense.date)}
                      {expense.subcategory_id && subcategoryMap.get(expense.subcategory_id) && (
                        <span> &middot; {subcategoryMap.get(expense.subcategory_id)}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories Quick View */}
      {!loading && categories.length > 0 && (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-foreground">Categories</h2>
            <Link href="/settings" className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 12).map(cat => (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-hover)] text-sm">
                <span>{cat.icon}</span>
                <span className="font-medium text-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
