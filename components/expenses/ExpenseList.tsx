'use client';

import { useState, useMemo } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useCategories } from '@/lib/hooks/useCategories';
import { usePaymentSources } from '@/lib/hooks/usePaymentSources';
import { Expense } from '@/lib/types/expense';
import { ExpenseCard } from './ExpenseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Plus, Filter, X, Search, DollarSign } from 'lucide-react';

interface ExpenseListProps {
  onAddNew: () => void;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ onAddNew, onEdit }: ExpenseListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('');
  const [paymentSourceFilter, setPaymentSourceFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filters = useMemo(() => ({
    category_id: categoryFilter || undefined,
    subcategory_id: subcategoryFilter || undefined,
    payment_source_id: paymentSourceFilter || undefined,
    start_date: startDateFilter || undefined,
    end_date: endDateFilter || undefined,
    search_query: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [categoryFilter, subcategoryFilter, paymentSourceFilter, startDateFilter, endDateFilter, searchQuery, sortBy, sortOrder]);

  const { expenses, loading, deleteExpense } = useExpenses(filters);
  const { categories, subcategories } = useCategories();
  const { paymentSources } = usePaymentSources();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setSubcategoryFilter('');
    setPaymentSourceFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = categoryFilter || subcategoryFilter || paymentSourceFilter || startDateFilter || endDateFilter || searchQuery;

  const availableSubcategories = useMemo(() => {
    if (!categoryFilter) return [];
    return subcategories.filter(sub => sub.category_id === categoryFilter);
  }, [categoryFilter, subcategories]);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  const subcategoryMap = new Map(subcategories.map(sub => [sub.id, sub.name]));
  const paymentSourceMap = new Map(paymentSources.map(ps => [ps.id, ps.name]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-foreground tracking-tight">Expenses</h2>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
            )}
          </Button>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
        <Input
          type="text"
          placeholder="Search by category, subcategory, payment source, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--muted)]">Sort by:</span>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
          className="w-32"
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="category">Category</option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="w-28"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Filter Expenses</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Category</label>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubcategoryFilter('');
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
            </div>

            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted)]">Subcategory</label>
                <Select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                >
                  <option value="">All Subcategories</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.icon} {subcategory.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Payment Source</label>
              <Select
                value={paymentSourceFilter}
                onChange={(e) => setPaymentSourceFilter(e.target.value)}
              >
                <option value="">All Sources</option>
                {paymentSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.icon} {source.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">Start Date</label>
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--muted)]">End Date</label>
              <Input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-2xl shimmer" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-[var(--muted)]" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">
            {hasActiveFilters ? 'No expenses found' : 'No expenses yet'}
          </p>
          <p className="text-sm text-[var(--muted)] mb-5">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Start tracking your expenses by adding your first one'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              categoryName={categoryMap.get(expense.category_id)}
              subcategoryName={expense.subcategory_id ? subcategoryMap.get(expense.subcategory_id) : undefined}
              paymentSourceName={expense.payment_source_id ? paymentSourceMap.get(expense.payment_source_id) : undefined}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
