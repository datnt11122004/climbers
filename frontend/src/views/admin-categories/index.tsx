'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { AdminCategoryTable } from '@/components/admin-categories/AdminCategoryTable';
import { CategoryFormModal } from '@/components/admin-categories/CategoryFormModal';
import { DeleteConfirmModal } from '@/components/admin-categories/DeleteConfirmModal';
import { CategoryService, Category, CreateCategoryDto } from '@/services/category.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCategories,
  setCategoryLoading,
  setCategoryError,
  addCategory,
  updateCategory,
  removeCategory,
} from '@/store/slices/categorySlice';
import { Loader2, Plus, Search } from 'lucide-react';

export default function AdminCategoriesView() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.category);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const load = async () => {
      dispatch(setCategoryLoading(true));
      try {
        const data = await CategoryService.getAll();
        dispatch(setCategories(data));
      } catch (err: any) {
        dispatch(setCategoryError(err.message));
      }
    };
    load();
  }, [dispatch]);

  // Create / Update
  const handleSubmit = useCallback(async (dto: CreateCategoryDto) => {
    if (editingCategory) {
      const updated = await CategoryService.update(editingCategory.id, dto);
      dispatch(updateCategory(updated));
    } else {
      const created = await CategoryService.create(dto);
      dispatch(addCategory(created));
    }
    setShowForm(false);
    setEditingCategory(null);
  }, [editingCategory, dispatch]);

  // Delete
  const handleDelete = useCallback(async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    try {
      await CategoryService.delete(deletingCategory.id);
      dispatch(removeCategory(deletingCategory.id));
      setDeletingCategory(null);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingCategory, dispatch]);

  const handleEdit = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
  }, []);

  // Filter
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort by sortOrder
  const sorted = [...filtered].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (loading) {
    return (
      <>
        <Header title="Quản lý Danh mục" description="Thêm, sửa, xoá các danh mục ứng dụng" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Quản lý Danh mục" description="Thêm, sửa, xoá các danh mục ứng dụng" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Count badge */}
          <span className="text-xs text-[#94a3b8] bg-[#1e293b] px-3 py-1.5 rounded-full border border-[#334155]">
            Tổng cộng: <span className="text-[#6366f1] font-semibold">{categories.length}</span> danh mục
          </span>

          {/* Add button */}
          <button
            onClick={() => { setEditingCategory(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminCategoryTable
        categories={sorted}
        onEdit={handleEdit}
        onDelete={setDeletingCategory}
      />

      {/* Form Modal */}
      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingCategory && (
        <DeleteConfirmModal
          categoryName={deletingCategory.name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCategory(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
