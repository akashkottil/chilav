'use client';

import { Investment } from '@/lib/types/investment';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface InvestmentCardProps {
  investment: Investment;
  investmentTypeName?: string;
  investmentTypeIcon?: string;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export function InvestmentCard({ investment, investmentTypeName, investmentTypeIcon, onEdit, onDelete }: InvestmentCardProps) {
  const isDeposit = investment.transaction_type === 'deposit';

  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${
            isDeposit ? 'bg-[var(--success)]/10' : 'bg-[var(--danger)]/10'
          }`}>
            {investmentTypeIcon || '💰'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-lg font-bold ${isDeposit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {isDeposit ? '+' : '-'}{formatCurrency(investment.amount)}
              </span>
              {isDeposit ? (
                <TrendingUp className="h-4 w-4 text-[var(--success)]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-[var(--danger)]" />
              )}
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isDeposit
                  ? 'bg-[var(--success)]/10 text-[var(--success)]'
                  : 'bg-[var(--danger)]/10 text-[var(--danger)]'
              }`}>
                {isDeposit ? 'Deposit' : 'Withdrawal'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
              {investmentTypeName && <span>{investmentTypeName}</span>}
              <span className="text-[var(--border)]">|</span>
              <span>{formatDate(investment.date)}</span>
              {investment.maturity_date && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <span>Maturity: {formatDate(investment.maturity_date)}</span>
                </>
              )}
              {investment.interest_rate && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <span>{investment.interest_rate}% APR</span>
                </>
              )}
            </div>

            {investment.notes && (
              <p className="mt-2 text-sm italic text-[var(--muted)]">
                &ldquo;{investment.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(investment)}
            aria-label="Edit investment"
            className="h-9 w-9 text-[var(--muted)] hover:text-[var(--primary)]"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(investment.id)}
            aria-label="Delete investment"
            className="h-9 w-9 text-[var(--muted)] hover:text-[var(--danger)]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
