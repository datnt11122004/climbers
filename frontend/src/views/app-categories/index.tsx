'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryGrid } from '@/components/app-categories/CategoryGrid';
import { CategoryToolbar } from '@/components/app-categories/CategoryToolbar';
import { CategoryService } from '@/services/category.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCategories, setCategoryLoading, setCategoryError, toggleFollow } from '@/store/slices/categorySlice';
import { Loader2 } from 'lucide-react';

export default function AppCategoriesView() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.category);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Track original follow state to detect changes
  const originalFollowedRef = useRef<Set<number>>(new Set());

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      dispatch(setCategoryLoading(true));
      try {
        let data;
        if (isAuthenticated && user) {
          data = await CategoryService.getForUser(user.id);
        } else {
          data = await CategoryService.getAll();
        }
        dispatch(setCategories(data));
        // Save original follow state
        originalFollowedRef.current = new Set(
          data.filter((c) => c.isFollowed).map((c) => c.id),
        );
      } catch (err: any) {
        dispatch(setCategoryError(err.message));
      }
    };
    loadCategories();
  }, [dispatch, isAuthenticated, user]);

  const handleToggleFollow = useCallback(
    (id: number) => {
      if (!isAuthenticated) return;
      dispatch(toggleFollow(id));
    },
    [dispatch, isAuthenticated],
  );

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const followedIds = categories.filter((c) => c.isFollowed).map((c) => c.id);
      await CategoryService.syncFollows(user.id, followedIds);
      // Update original follow state
      originalFollowedRef.current = new Set(followedIds);
    } catch (err: any) {
      console.error('Failed to save follows:', err);
    } finally {
      setSaving(false);
    }
  }, [user, categories]);

  // Filter categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Detect changes from original
  const hasChanges = categories.some((c) => {
    const wasFollowed = originalFollowedRef.current.has(c.id);
    return !!c.isFollowed !== wasFollowed;
  });

  const followedCount = categories.filter((c) => c.isFollowed).length;

  if (loading) {
    return (
      <>
        <Header title="Quản lý Dòng App" description="Theo dõi và phân tích các dòng app theo category" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Quản lý Dòng App" description="Theo dõi và phân tích các dòng app theo category" />

      <CategoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        followedCount={followedCount}
        totalCount={categories.length}
        onSave={handleSave}
        saving={saving}
        hasChanges={hasChanges}
      />

      <CategoryGrid
        categories={filteredCategories}
        onToggleFollow={handleToggleFollow}
      />
    </>
  );
}
