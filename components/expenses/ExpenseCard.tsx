'use client';

import { Expense } from '@/lib/types/expense';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePartner } from '@/context/PartnerContext';

interface ExpenseCardProps {
  expense: Expense;
  categoryName?: string;
  subcategoryName?: string;
  paymentSourceName?: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, categoryName, subcategoryName, paymentSourceName, onEdit, onDelete }: ExpenseCardProps) {
  const { user } = useAuth();
  const { partner } = usePartner();

  const getPaidByName = () => {
    if (!expense.paid_by_user_id) return null;
    if (expense.paid_by_user_id === user?.id) return user?.user_metadata?.full_name || user?.email || 'You';
    return 'Partner';
  };

  const getExpenseOwner = () => {
    if (expense.user_id === user?.id) return user?.user_metadata?.full_name || user?.email || 'You';
    return 'Partner';
  };

  const paidByName = getPaidByName();
  const expenseOwner = getExpenseOwner();
  const isOwnExpense = expense.user_id === user?.id;

  return (
    <div className="group flex items-center gap-4 p-4 -mx-2 rounded-2xl hover:bg-[var(--surface-hover)] transition-all duration-200">
      <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-[var(--surface-alt)] flex items-center justify-center text-2xl">
        {expense.custom_icon || '💰'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{categoryName || 'Expense'}</span>
          {expense.is_shared && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-pink-500/10 text-pink-500">
              Shared
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--muted)] mt-0.5">
          <span>{formatDateTime(expense.date, expense.time)}</span>
          {subcategoryName && <><span>&middot;</span><span>{subcategoryName}</span></>}
          {paymentSourceName && <><span>&middot;</span><span>{paymentSourceName}</span></>}
          {partner && <><span>&middot;</span><span>{expenseOwner}</span></>}
          {paidByName && <><span>&middot;</span><span>paid by {paidByName}</span></>}
        </div>
        {expense.is_shared && expense.amount_paid_by_user !== null && expense.amount_paid_by_partner !== null && (
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
            <span className="font-medium text-pink-500">Split:</span>
            <span>{expenseOwner === 'You' ? 'You' : expenseOwner}: {formatCurrency(expense.user_id === user?.id ? (expense.amount_paid_by_user || 0) : (expense.amount_paid_by_partner || 0))}</span>
            <span>{expenseOwner === 'You' ? 'Partner' : 'You'}: {formatCurrency(expense.user_id === user?.id ? (expense.amount_paid_by_partner || 0) : (expense.amount_paid_by_user || 0))}</span>
          </div>
        )}
        {expense.notes && (
          <p className="mt-1 text-xs italic text-[var(--muted)] truncate max-w-md">&ldquo;{expense.notes}&rdquo;</p>
        )}
      </div>

      <span className="text-sm font-bold text-foreground tabular-nums whitespace-nowrap">
        -{formatCurrency(expense.amount)}
      </span>

      {isOwnExpense && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-8 w-8 text-[var(--muted)] hover:text-[var(--primary)]">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="h-8 w-8 text-[var(--muted)] hover:text-[var(--danger)]">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
