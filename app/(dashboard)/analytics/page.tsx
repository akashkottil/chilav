'use client';

import { useState } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { usePaymentSources } from '@/lib/hooks/usePaymentSources';
import { PieChartComponent } from '@/components/charts/PieChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import { LineChartComponent } from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

import { formatCurrency } from '@/lib/utils/formatters';
import { DollarSign, Users, User, ShoppingBag, CreditCard } from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'week' | 'all'>('month');
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'shared' | 'individual'>('all');
  const [paymentSourceFilter, setPaymentSourceFilter] = useState<string>('');
  const { paymentSources } = usePaymentSources();
  const { categoryDistribution, expenseTrends, monthlyStats, spendingSummary, loading } = useAnalytics(period, expenseFilter, paymentSourceFilter || undefined);

  const summaryCards = [
    { label: 'Total Spend', value: spendingSummary?.total_spend || 0, icon: DollarSign, color: 'from-[var(--primary)] to-[var(--primary-dark)]', shadow: 'shadow-[var(--primary)]/20' },
    { label: 'Shared Spend', value: spendingSummary?.shared_spend || 0, icon: Users, color: 'from-[var(--success)] to-emerald-600', shadow: 'shadow-[var(--success)]/20' },
    { label: 'Your Share', value: spendingSummary?.your_share_of_shared || 0, icon: User, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
    { label: 'Individual Spend', value: spendingSummary?.individual_spend || 0, icon: ShoppingBag, color: 'from-[var(--warning)] to-amber-600', shadow: 'shadow-[var(--warning)]/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Analytics</h1>
          <p className="text-[var(--muted)] mt-1">
            Insights into your spending patterns
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={expenseFilter}
            onChange={(e) => setExpenseFilter(e.target.value as 'all' | 'shared' | 'individual')}
            className="w-40"
          >
            <option value="all">All Expenses</option>
            <option value="shared">Shared Only</option>
            <option value="individual">Individual Only</option>
          </Select>
          <Select
            value={paymentSourceFilter}
            onChange={(e) => setPaymentSourceFilter(e.target.value)}
            className="w-48"
          >
            <option value="">All Sources</option>
            {paymentSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.icon} {source.name}
              </option>
            ))}
          </Select>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'month' | 'week' | 'all')}
            className="w-32"
          >
            <option value="month">Monthly</option>
            <option value="week">Weekly</option>
            <option value="all">All Time</option>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
                  <p className="text-2xl font-extrabold mt-1">{formatCurrency(card.value)}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] rounded-xl shimmer" />
            ) : (
              <PieChartComponent data={categoryDistribution} height={300} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] rounded-xl shimmer" />
            ) : (
              <LineChartComponent data={expenseTrends} height={300} />
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Expense Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] rounded-xl shimmer" />
            ) : (
              <BarChartComponent data={expenseTrends} height={350} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl shimmer" />)}
            </div>
          ) : spendingSummary?.total_spend_by_category && spendingSummary.total_spend_by_category.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Category</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingSummary.total_spend_by_category.map((item) => (
                    <tr key={item.category_id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-semibold">{item.category_name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-bold">{formatCurrency(item.amount)}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 bg-[var(--background)] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full gradient-bg"
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[var(--muted)] w-12 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--muted)]">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategory Breakdown */}
      {spendingSummary?.total_spend_by_subcategory && spendingSummary.total_spend_by_subcategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Subcategory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl shimmer" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Subcategory</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Amount</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendingSummary.total_spend_by_subcategory.map((item) => (
                      <tr key={item.subcategory_id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="py-3 px-4 text-sm text-[var(--muted)]">{item.category_name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-semibold">{item.subcategory_name}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-bold">{formatCurrency(item.amount)}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 bg-[var(--background)] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-[var(--muted)] w-12 text-right">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Source Analysis */}
      {spendingSummary?.total_spend_by_payment_source && spendingSummary.total_spend_by_payment_source.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                Spending by Payment Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] rounded-xl shimmer" />
              ) : (
                <PieChartComponent
                  data={spendingSummary.total_spend_by_payment_source.map((item, index) => {
                    const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6'];
                    return {
                      category_id: item.payment_source_id,
                      category_name: item.payment_source_name,
                      amount: item.amount,
                      percentage: item.percentage,
                      icon: item.icon || '💰',
                      color: COLORS[index % COLORS.length],
                    };
                  })}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Source Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl shimmer" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Payment Source</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Type</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Amount</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spendingSummary.total_spend_by_payment_source.map((item) => (
                        <tr key={item.payment_source_id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-hover)] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon || '💰'}</span>
                              <span className="font-semibold">{item.payment_source_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface-hover)] capitalize">
                              {item.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 font-bold">{formatCurrency(item.amount)}</td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-3">
                              <div className="w-24 bg-[var(--background)] rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-[var(--muted)] w-12 text-right">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Credit Card Analytics */}
      {spendingSummary?.credit_card_spending && spendingSummary.credit_card_spending.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--danger)]" />
                Credit Card Spending Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-24 rounded-xl shimmer" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  {spendingSummary.credit_card_spending.map((cardData) => (
                    <div key={cardData.card_name} className="border-b border-[var(--border)] pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold">{cardData.card_name}</h4>
                        <div className="text-right">
                          <div className="text-xs text-[var(--muted)]">Total Spend</div>
                          <div className="text-xl font-extrabold text-[var(--danger)]">
                            {formatCurrency(cardData.total_spend)}
                          </div>
                        </div>
                      </div>

                      {cardData.category_breakdown.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                            Spending by Category
                          </div>
                          <div className="space-y-2.5">
                            {cardData.category_breakdown.map((cat, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-sm text-[var(--muted)]">{cat.category_name}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 bg-[var(--background)] rounded-full h-2 overflow-hidden">
                                    <div
                                      className="gradient-bg h-2 rounded-full"
                                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold w-20 text-right">
                                    {formatCurrency(cat.amount)}
                                  </span>
                                  <span className="text-xs text-[var(--muted)] w-12 text-right">
                                    {cat.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-[var(--muted)]">
                          No category breakdown available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Card Spending Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-12 rounded-xl shimmer" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Credit Card</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Total Spend</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spendingSummary.credit_card_spending.map((cardData) => {
                        const totalCCSpend = spendingSummary.credit_card_spending.reduce((sum, c) => sum + c.total_spend, 0);
                        const percentage = totalCCSpend > 0 ? (cardData.total_spend / totalCCSpend) * 100 : 0;
                        return (
                          <tr key={cardData.card_name} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-hover)] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">💳</span>
                                <span className="font-semibold">{cardData.card_name}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-bold text-[var(--danger)]">
                              {formatCurrency(cardData.total_spend)}
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="flex items-center justify-end gap-3">
                                <div className="w-24 bg-[var(--background)] rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-[var(--danger)] h-2 rounded-full"
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-[var(--muted)] w-12 text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
