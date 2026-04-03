'use client';

import { useState, useMemo } from 'react';
import { useInvestments } from '@/lib/hooks/useInvestments';
import { Investment } from '@/lib/types/investment';
import { InvestmentCard } from './InvestmentCard';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface InvestmentListProps {
  onAddNew: () => void;
  onEdit: (investment: Investment) => void;
}

export function InvestmentList({ onAddNew, onEdit }: InvestmentListProps) {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [transactionFilter, setTransactionFilter] = useState<'deposit' | 'withdrawal' | ''>('');

  const filters = useMemo(() => ({
    investment_type_id: typeFilter || undefined,
    transaction_type: transactionFilter || undefined,
  }), [typeFilter, transactionFilter]);

  const { investments, investmentTypes, loading, deleteInvestment } = useInvestments(filters);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      await deleteInvestment(id);
    }
  };

  const totalsByType = useMemo(() => {
    const totals = new Map<string, { deposits: number; withdrawals: number }>();
    investments.forEach(inv => {
      const current = totals.get(inv.investment_type_id) || { deposits: 0, withdrawals: 0 };
      if (inv.transaction_type === 'deposit') {
        current.deposits += inv.amount;
      } else {
        current.withdrawals += inv.amount;
      }
      totals.set(inv.investment_type_id, current);
    });
    return totals;
  }, [investments]);

  const typeMap = new Map(investmentTypes.map(type => [type.id, { name: type.name, icon: type.icon }]));

  const overallTotal = useMemo(() => {
    return investments.reduce((sum, inv) => {
      return inv.transaction_type === 'deposit' ? sum + inv.amount : sum - inv.amount;
    }, 0);
  }, [investments]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-foreground tracking-tight">Investments</h2>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="text-sm font-medium text-[var(--muted)] mb-2">Net Investment</div>
          <div className={`text-2xl font-extrabold ${overallTotal >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {formatCurrency(Math.abs(overallTotal))}
          </div>
        </div>
        {Array.from(totalsByType.entries()).slice(0, 3).map(([typeId, totals]) => {
          const type = typeMap.get(typeId);
          if (!type) return null;
          const net = totals.deposits - totals.withdrawals;
          return (
            <div key={typeId} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-sm font-medium text-[var(--muted)] mb-2">
                {type.icon} {type.name}
              </div>
              <div className={`text-xl font-extrabold ${net >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {formatCurrency(Math.abs(net))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All Types</option>
          {investmentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.name}
            </option>
          ))}
        </Select>
        <Select
          value={transactionFilter}
          onChange={(e) => setTransactionFilter(e.target.value as 'deposit' | 'withdrawal' | '')}
          className="w-36"
        >
          <option value="">All</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl shimmer" />
          ))}
        </div>
      ) : investments.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-[var(--muted)]" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">No investments found</p>
          <p className="text-sm text-[var(--muted)] mb-5">Start tracking your investments</p>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Investment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((investment) => {
            const type = typeMap.get(investment.investment_type_id);
            return (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                investmentTypeName={type?.name}
                investmentTypeIcon={type?.icon}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
