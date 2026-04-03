'use client';

import { useState } from 'react';
import { Category, Subcategory } from '@/lib/types/category';
import { useCategories } from '@/lib/hooks/useCategories';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { CategoryForm } from './CategoryForm';
import { SubcategoryForm } from './SubcategoryForm';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { CategoryFormData, SubcategoryFormData } from '@/lib/types/category';

export function CategoryList() {
  const { categories, subcategories, loading, createCategory, updateCategory, deleteCategory, createSubcategory, updateSubcategory, deleteSubcategory, refetch } = useCategories();
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const isDefaultCategory = (category: Category) => category.user_id === null;
  const isUserCategory = (category: Category) => category.user_id === user?.id;

  const getSubcategoriesByCategory = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, data);
        if (result.error) { setError(result.error); return; }
      } else {
        const result = await createCategory(data);
        if (result.error) { setError(result.error); return; }
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubcategorySubmit = async (data: SubcategoryFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      if (editingSubcategory) {
        const result = await updateSubcategory(editingSubcategory.id, { name: data.name, icon: data.icon, color: data.color });
        if (result.error) { setError(result.error); return; }
      } else {
        const result = await createSubcategory(data);
        if (result.error) { setError(result.error); return; }
      }
      setShowSubcategoryForm(false);
      setEditingSubcategory(null);
      setSelectedCategoryForSubcategory(null);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!isUserCategory(category)) { setError('You can only delete your own categories'); return; }
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    setFormLoading(true);
    setError(null);
    try {
      const result = await deleteCategory(category.id);
      if (result.error) { setError(result.error); } else { await refetch(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (!confirm(`Are you sure you want to delete "${subcategory.name}"?`)) return;
    setFormLoading(true);
    setError(null);
    try {
      const result = await deleteSubcategory(subcategory.id);
      if (result.error) { setError(result.error); } else { await refetch(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddSubcategory = (categoryId: string) => {
    setSelectedCategoryForSubcategory(categoryId);
    setEditingSubcategory(null);
    setShowSubcategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    if (!isUserCategory(category)) { setError('You can only edit your own categories'); return; }
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSelectedCategoryForSubcategory(subcategory.category_id);
    setShowSubcategoryForm(true);
  };

  if (showCategoryForm) {
    return (
      <CategoryForm
        category={editingCategory || undefined}
        onSubmit={handleCategorySubmit}
        onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); setError(null); }}
        loading={formLoading}
      />
    );
  }

  if (showSubcategoryForm) {
    return (
      <SubcategoryForm
        subcategory={editingSubcategory || undefined}
        categories={categories}
        onSubmit={handleSubcategorySubmit}
        onCancel={() => { setShowSubcategoryForm(false); setEditingSubcategory(null); setSelectedCategoryForSubcategory(null); setError(null); }}
        loading={formLoading}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}
      </div>
    );
  }

  const defaultCategories = categories.filter(cat => isDefaultCategory(cat));
  const userCategories = categories.filter(cat => isUserCategory(cat));

  const renderCategoryItem = (category: Category, showActions: boolean) => {
    const categorySubcategories = getSubcategoriesByCategory(category.id);
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4 text-[var(--muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--muted)]" />}
              <span className="text-lg">{category.icon}</span>
              <span className="font-semibold">{category.name}</span>
              <span className="text-xs text-[var(--muted)] ml-1">
                ({categorySubcategories.length})
              </span>
            </button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleAddSubcategory(category.id)} title="Add subcategory" className="h-8 w-8 p-0 text-[var(--muted)] hover:text-[var(--primary)]">
                <Plus className="h-4 w-4" />
              </Button>
              {showActions && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)} title="Edit" className="h-8 w-8 p-0 text-[var(--muted)] hover:text-[var(--primary)]">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category)} title="Delete" disabled={formLoading} className="h-8 w-8 p-0 text-[var(--muted)] hover:text-[var(--danger)]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 ml-11 space-y-1.5">
            {categorySubcategories.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-2">No subcategories</p>
            ) : (
              categorySubcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="group flex items-center justify-between p-2.5 rounded-lg bg-[var(--background)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{subcategory.icon}</span>
                    <span className="text-sm font-medium">{subcategory.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSubcategory(subcategory)} title="Edit" className="h-7 w-7 p-0 text-[var(--muted)] hover:text-[var(--primary)]">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSubcategory(subcategory)} title="Delete" className="h-7 w-7 p-0 text-[var(--muted)] hover:text-[var(--danger)]">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-3">
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Categories</h3>
        <Button size="sm" onClick={() => { setEditingCategory(null); setShowCategoryForm(true); setError(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {defaultCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Default Categories</h4>
          <div className="space-y-2">
            {defaultCategories.map((category) => renderCategoryItem(category, false))}
          </div>
        </div>
      )}

      {userCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Your Categories</h4>
          <div className="space-y-2">
            {userCategories.map((category) => renderCategoryItem(category, true))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center">
            <Tag className="h-7 w-7 text-[var(--muted)]" />
          </div>
          <p className="text-[var(--muted)]">No categories found. Create your first category to get started.</p>
        </div>
      )}
    </div>
  );
}
