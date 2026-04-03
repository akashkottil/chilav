'use client';

import { useState } from 'react';
import { Investment, InvestmentFormData } from '@/lib/types/investment';
import { useInvestments } from '@/lib/hooks/useInvestments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvestmentFormProps {
  investment?: Investment;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function InvestmentForm({ investment, onSubmit, onCancel, loading }: InvestmentFormProps) {
  const { investmentTypes } = useInvestments();
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<InvestmentFormData>({
    investment_type_id: investment?.investment_type_id || '',
    amount: investment?.amount || 0,
    date: investment?.date || new Date().toISOString().split('T')[0],
    transaction_type: investment?.transaction_type || 'deposit',
    notes: investment?.notes || undefined,
    maturity_date: investment?.maturity_date || undefined,
    interest_rate: investment?.interest_rate || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!formData.investment_type_id) {
      setErrors(['Please select an investment type']);
      return;
    }

    if (formData.amount <= 0) {
      setErrors(['Amount must be greater than 0']);
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = <K extends keyof InvestmentFormData>(
    field: K,
    value: InvestmentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedType = investmentTypes.find(t => t.id === formData.investment_type_id);
  const showMaturityFields = selectedType?.name.includes('FD') || selectedType?.name.includes('RD');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{investment ? 'Edit Investment' : 'Add New Investment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="investment_type_id">Investment Type</Label>
            <Select
              id="investment_type_id"
              value={formData.investment_type_id}
              onChange={(e) => handleChange('investment_type_id', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select investment type</option>
              {investmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type</Label>
            <Select
              id="transaction_type"
              value={formData.transaction_type}
              onChange={(e) => handleChange('transaction_type', e.target.value as 'deposit' | 'withdrawal')}
              required
              disabled={loading}
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {showMaturityFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="maturity_date">Maturity Date (Optional)</Label>
                <Input
                  id="maturity_date"
                  type="date"
                  value={formData.maturity_date || ''}
                  onChange={(e) => handleChange('maturity_date', e.target.value || undefined)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Interest Rate % (Optional)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interest_rate || ''}
                  onChange={(e) => handleChange('interest_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Add any notes..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value || undefined)}
              disabled={loading}
            />
          </div>

          {errors.length > 0 && (
            <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-4">
              <ul className="text-sm text-[var(--danger)] space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>&#x2022; {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </span>
              ) : investment ? 'Update' : 'Add Investment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
