'use client';

import { Category } from '@/services/category.service';
import { CategoryCard } from './CategoryCard';

type CategoryGridProps = {
  categories: Category[];
  onToggleFollow: (id: number) => void;
};

export function CategoryGrid({ categories, onToggleFollow }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <p className="text-[#64748b] text-sm">Không có category nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="animate-in"
          style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
        >
          <CategoryCard
            category={category}
            isFollowed={!!category.isFollowed}
            onToggleFollow={onToggleFollow}
          />
        </div>
      ))}
    </div>
  );
}
