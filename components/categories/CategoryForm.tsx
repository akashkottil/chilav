'use client';

import { useState } from 'react';
import { Category, CategoryFormData } from '@/lib/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const COMMON_ICONS = ['🏠', '🍽️', '🚗', '📱', '🛍️', '🏥', '🎬', '✈️', '💳', '🎁', '📈', '📚', '👶', '📦', '💰', '🍔', '☕', '🎮', '🎵', '💊', '👔', '📺', '🌐', '⚡', '🔧', '🎓', '💻', '🎯'];

const COMMON_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6',
  '#ec4899', '#84cc16', '#3b82f6', '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e', '#eab308',
  '#d946ef', '#64748b', '#0891b2', '#059669', '#dc2626', '#7c3aed', '#c026d3',
];

export function CategoryForm({ category, onSubmit, onCancel, loading }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    icon: category?.icon || '📦',
    color: category?.color || '#6366f1',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim()) { setError('Category name is required'); return; }
    try { await onSubmit(formData); } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save category'); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--muted)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-3">
              <p className="text-sm text-[var(--danger)]">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Housing & Home" required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-3">
              <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} maxLength={2} className="w-16 text-center text-xl" disabled={loading} />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {COMMON_ICONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })} disabled={loading}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${formData.icon === icon ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)] scale-110' : 'border border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                  >{icon}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-3">
              <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-16 h-10 p-1 cursor-pointer" disabled={loading} />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {COMMON_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} disabled={loading}
                    className={`w-9 h-9 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
