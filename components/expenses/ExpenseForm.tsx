'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFormData } from '@/lib/types/expense';
import { useCategories } from '@/lib/hooks/useCategories';
import { usePaymentSources } from '@/lib/hooks/usePaymentSources';
import { useAuth } from '@/context/AuthContext';
import { usePartner } from '@/context/PartnerContext';
import { validateExpense } from '@/lib/utils/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ExpenseForm({ expense, onSubmit, onCancel, loading }: ExpenseFormProps) {
  const { categories, subcategories } = useCategories();
  const { paymentSources } = usePaymentSources();
  const { user } = useAuth();
  const { partner } = usePartner();
  const [partnerUser, setPartnerUser] = useState<{ id: string; email: string; name?: string } | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: expense?.amount || 0,
    category_id: expense?.category_id || '',
    subcategory_id: expense?.subcategory_id || null,
    date: expense?.date || new Date().toISOString().split('T')[0],
    time: expense?.time || null,
    notes: expense?.notes || undefined,
    custom_icon: expense?.custom_icon || undefined,
    paid_by_user_id: expense?.paid_by_user_id || null,
    is_shared: expense?.is_shared || false,
    amount_paid_by_user: expense?.amount_paid_by_user || null,
    amount_paid_by_partner: expense?.amount_paid_by_partner || null,
    payment_source_id: expense?.payment_source_id || null,
  });

  useEffect(() => {
    if (!partner || !user) {
      setPartnerUser(null);
      return;
    }
    const partnerUserId = partner.user1_id === user.id ? partner.user2_id : partner.user1_id;
    setPartnerUser({ id: partnerUserId, email: '', name: 'Partner' });
  }, [partner, user]);

  const currentUserName = user?.user_metadata?.full_name || user?.email || 'You';
  const partnerUserName = 'Partner';

  const [errors, setErrors] = useState<string[]>([]);

  const availableSubcategories = subcategories.filter(
    sub => sub.category_id === formData.category_id
  );

  const isCreditCardRepaymentCategory = !!categories.find(
    cat => cat.id === formData.category_id && cat.name === 'Credit Card Repayment'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    const validationErrors = validateExpense(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    await onSubmit(formData);
  };

  const handleChange = <K extends keyof ExpenseFormData>(
    field: K,
    value: ExpenseFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Label htmlFor="category_id">Category</Label>
            <Select
              id="category_id"
              value={formData.category_id}
              onChange={(e) => {
                handleChange('category_id', e.target.value);
                handleChange('subcategory_id', null);
              }}
              required
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>
          </div>

          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategory_id">
                {isCreditCardRepaymentCategory ? 'Select a Card' : 'Subcategory (Optional)'}
              </Label>
              <Select
                id="subcategory_id"
                value={formData.subcategory_id || ''}
                onChange={(e) => handleChange('subcategory_id', e.target.value || null)}
                disabled={loading}
                required={isCreditCardRepaymentCategory}
              >
                <option value="">{isCreditCardRepaymentCategory ? 'Select a credit card' : 'None'}</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.icon} {subcategory.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="time">Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                value={formData.time || ''}
                onChange={(e) => handleChange('time', e.target.value || null)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_source_id">Payment Source (Optional)</Label>
            <Select
              id="payment_source_id"
              value={formData.payment_source_id || ''}
              onChange={(e) => handleChange('payment_source_id', e.target.value || null)}
              disabled={loading}
            >
              <option value="">Not specified</option>
              {paymentSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.icon} {source.name}
                </option>
              ))}
            </Select>
          </div>

          {partner && user && (
            <div className="space-y-2">
              <Label htmlFor="paid_by_user_id">Who Paid (Optional)</Label>
              <Select
                id="paid_by_user_id"
                value={formData.paid_by_user_id || ''}
                onChange={(e) => handleChange('paid_by_user_id', e.target.value || null)}
                disabled={loading}
              >
                <option value="">Not specified</option>
                <option value={user.id}>{currentUserName}</option>
                <option value={partnerUser?.id || ''}>{partnerUserName}</option>
              </Select>
            </div>
          )}

          {partner ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_shared"
                  checked={formData.is_shared || false}
                  onChange={(e) => {
                    handleChange('is_shared', e.target.checked);
                    if (!e.target.checked) {
                      handleChange('amount_paid_by_user', null);
                      handleChange('amount_paid_by_partner', null);
                    } else {
                      if (!formData.amount_paid_by_user && !formData.amount_paid_by_partner) {
                        const half = formData.amount / 2;
                        handleChange('amount_paid_by_user', half);
                        handleChange('amount_paid_by_partner', half);
                      }
                    }
                  }}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <Label htmlFor="is_shared" className="cursor-pointer">
                  Mark as shared expense
                </Label>
              </div>

              {formData.is_shared && (
                <div className="ml-7 p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/15 space-y-3">
                  <p className="text-sm font-semibold text-[var(--primary)]">Split the Expense</p>
                  <p className="text-xs text-[var(--muted)]">
                    Specify how much each person paid. Total must equal the expense amount.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="amount_paid_by_user" className="text-xs">Your Share (INR)</Label>
                      <Input
                        id="amount_paid_by_user"
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.amount}
                        value={formData.amount_paid_by_user || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleChange('amount_paid_by_user', value);
                          handleChange('amount_paid_by_partner', Math.max(0, formData.amount - value));
                        }}
                        disabled={loading}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount_paid_by_partner" className="text-xs">Partner&apos;s Share (INR)</Label>
                      <Input
                        id="amount_paid_by_partner"
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.amount}
                        value={formData.amount_paid_by_partner || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleChange('amount_paid_by_partner', value);
                          handleChange('amount_paid_by_user', Math.max(0, formData.amount - value));
                        }}
                        disabled={loading}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="text-xs pt-2 border-t border-[var(--primary)]/15 flex justify-between items-center">
                    <span className="text-[var(--muted)]">Total:</span>
                    <span className={`font-bold ${
                      (formData.amount_paid_by_user || 0) + (formData.amount_paid_by_partner || 0) === formData.amount
                        ? 'text-[var(--success)]'
                        : 'text-[var(--danger)]'
                    }`}>
                      INR {((formData.amount_paid_by_user || 0) + (formData.amount_paid_by_partner || 0)).toFixed(2)}
                      {' / '}
                      INR {formData.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--surface-hover)] p-4">
              <p className="text-xs text-[var(--muted)]">
                To mark expenses as shared, link with a partner in{' '}
                <a href="/settings" className="font-semibold text-[var(--primary)] hover:underline">Settings</a>.
              </p>
            </div>
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
              ) : expense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
