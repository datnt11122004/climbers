'use client';

import { Category } from '@/services/category.service';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

type AdminCategoryTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

const colorHex: Record<string, string> = {
  blue: '#3b82f6', green: '#10b981', pink: '#ec4899', orange: '#f97316',
  cyan: '#06b6d4', yellow: '#eab308', red: '#ef4444', violet: '#8b5cf6',
  teal: '#14b8a6', indigo: '#6366f1', fuchsia: '#d946ef', lime: '#84cc16',
  rose: '#f43f5e', sky: '#0ea5e9', amber: '#f59e0b',
};

function getIcon(iconName: string | null) {
  if (!iconName) return LucideIcons.Layers;
  const pascalName = iconName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  return (LucideIcons as any)[pascalName] || LucideIcons.Layers;
}

export function AdminCategoryTable({ categories, onEdit, onDelete }: AdminCategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <p className="text-[#64748b] text-sm">Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-[#334155]/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155]">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-10">#</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider">Danh mục</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Slug</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Mô tả</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-28">Trạng thái</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-24">Thứ tự</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider w-28">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => {
              const Icon = getIcon(cat.icon);
              const color = colorHex[cat.color || 'blue'] || colorHex.blue;

              return (
                <tr
                  key={cat.id}
                  className="border-b border-[#334155]/30 hover:bg-[#334155]/20 transition-colors animate-in"
                  style={{ animationDelay: `${index * 0.03}s`, opacity: 0 }}
                >
                  {/* Order */}
                  <td className="px-5 py-3.5">
                    <span className="text-[#64748b] flex items-center gap-1">
                      <GripVertical className="w-3.5 h-3.5 opacity-40" />
                      {cat.sortOrder ?? index}
                    </span>
                  </td>

                  {/* Name + Icon */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="font-medium text-[#f1f5f9]">{cat.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <code className="text-xs bg-[#0f172a] text-[#94a3b8] px-2 py-1 rounded font-mono">
                      {cat.slug}
                    </code>
                  </td>

                  {/* Description */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-[#64748b] text-xs line-clamp-1 max-w-[200px]">
                      {cat.description || '—'}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        cat.active !== false
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-[#334155]/50 text-[#64748b]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.active !== false ? 'bg-emerald-400' : 'bg-[#64748b]'}`} />
                      {cat.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Sort order */}
                  <td className="px-5 py-3.5 text-center text-[#94a3b8]">
                    {cat.sortOrder ?? 0}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(cat)}
                        className="p-2 rounded-lg text-[#94a3b8] hover:text-[#818cf8] hover:bg-[#6366f1]/10 transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cat)}
                        className="p-2 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
