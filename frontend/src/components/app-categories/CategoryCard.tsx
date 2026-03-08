'use client';

import { Category } from '@/services/category.service';
import * as LucideIcons from 'lucide-react';

type CategoryCardProps = {
  category: Category;
  isFollowed: boolean;
  onToggleFollow: (id: number) => void;
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  green:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  pink:    { bg: 'bg-pink-500/10',    text: 'text-pink-400',    border: 'border-pink-500/30' },
  orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  yellow:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  border: 'border-yellow-500/30' },
  red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/30' },
  teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/30' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/30' },
  fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  lime:    { bg: 'bg-lime-500/10',    text: 'text-lime-400',    border: 'border-lime-500/30' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/30' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30' },
};

function getIcon(iconName: string | null) {
  if (!iconName) return LucideIcons.Layers;
  // Convert kebab-case to PascalCase
  const pascalName = iconName
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  return (LucideIcons as any)[pascalName] || LucideIcons.Layers;
}

export function CategoryCard({ category, isFollowed, onToggleFollow }: CategoryCardProps) {
  const colors = colorMap[category.color || 'blue'] || colorMap.blue;
  const Icon = getIcon(category.icon);
  const followersCount = category._count?.followers ?? category.followersCount ?? 0;

  return (
    <div
      className={`glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer border ${
        isFollowed ? colors.border : 'border-transparent'
      }`}
      onClick={() => onToggleFollow(category.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isFollowed
              ? `${colors.border} ${colors.bg}`
              : 'border-[#475569]'
          }`}
        >
          {isFollowed && (
            <LucideIcons.Check className={`w-3 h-3 ${colors.text}`} />
          )}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1">{category.name}</h3>
      {category.description && (
        <p className="text-xs text-[#64748b] line-clamp-2 mb-3">{category.description}</p>
      )}

      <div className="flex items-center gap-1 text-xs text-[#64748b]">
        <LucideIcons.Users className="w-3 h-3" />
        <span>{followersCount} followers</span>
      </div>
    </div>
  );
}
