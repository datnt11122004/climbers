'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Category, CreateCategoryDto } from '@/services/category.service';

type CategoryFormModalProps = {
  category?: Category | null;
  onSubmit: (dto: CreateCategoryDto) => Promise<void>;
  onClose: () => void;
};

const COLOR_OPTIONS = [
  'blue', 'green', 'pink', 'orange', 'cyan', 'yellow', 'red',
  'violet', 'teal', 'indigo', 'fuchsia', 'lime', 'rose', 'sky', 'amber',
];

const COLOR_HEX: Record<string, string> = {
  blue: '#3b82f6', green: '#10b981', pink: '#ec4899', orange: '#f97316',
  cyan: '#06b6d4', yellow: '#eab308', red: '#ef4444', violet: '#8b5cf6',
  teal: '#14b8a6', indigo: '#6366f1', fuchsia: '#d946ef', lime: '#84cc16',
  rose: '#f43f5e', sky: '#0ea5e9', amber: '#f59e0b',
};

const ICON_OPTIONS = [
  'layers', 'monitor-smartphone', 'shield', 'zap', 'globe', 'lock',
  'database', 'cpu', 'wifi', 'cloud', 'camera', 'music', 'gamepad-2',
  'shopping-cart', 'heart', 'star', 'trending-up', 'bar-chart-3',
  'message-circle', 'video', 'image', 'map-pin', 'clock', 'calendar',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryFormModal({ category, onSubmit, onClose }: CategoryFormModalProps) {
  const isEdit = !!category;
  const [loading, setLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const [form, setForm] = useState<CreateCategoryDto>({
    name: '',
    slug: '',
    description: '',
    icon: 'layers',
    color: 'blue',
    sortOrder: 0,
    active: true,
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || 'layers',
        color: category.color || 'blue',
        sortOrder: category.sortOrder ?? 0,
        active: category.active !== false,
      });
      setAutoSlug(false);
    }
  }, [category]);

  const handleNameChange = useCallback((name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      ...(autoSlug ? { slug: slugify(name) } : {}),
    }));
  }, [autoSlug]);

  const handleSlugChange = useCallback((slug: string) => {
    setAutoSlug(false);
    setForm((prev) => ({ ...prev, slug }));
  }, []);

  const handleChange = useCallback((field: keyof CreateCategoryDto, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors';
  const labelClass = 'block text-xs font-medium text-[#94a3b8] mb-1.5';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in border border-[#334155]">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 pb-4 border-b border-[#334155] bg-[#1e293b]/90 backdrop-blur-sm rounded-t-2xl">
          <h3 className="text-lg font-semibold text-[#f1f5f9]">
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Tên danh mục *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Remote Control"
              className={inputClass}
              required
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="VD: remote-control"
              className={inputClass}
              required
              maxLength={100}
            />
            {autoSlug && (
              <p className="text-[10px] text-[#64748b] mt-1">Tự động tạo từ tên</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về danh mục..."
              className={`${inputClass} resize-none h-20`}
              maxLength={500}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className={labelClass}>Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange('color', c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c
                      ? 'ring-2 ring-offset-2 ring-offset-[#1e293b] ring-[#f1f5f9] scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className={labelClass}>Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleChange('icon', iconName)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                    form.icon === iconName
                      ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/50'
                      : 'bg-[#0f172a] text-[#64748b] border border-[#334155] hover:text-[#94a3b8]'
                  }`}
                >
                  {iconName}
                </button>
              ))}
            </div>
          </div>

          {/* Sort order + Active row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Thứ tự sắp xếp</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                className={inputClass}
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Trạng thái</label>
              <button
                type="button"
                onClick={() => handleChange('active', !form.active)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  form.active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#0f172a] text-[#64748b] border-[#334155]'
                }`}
              >
                {form.active ? '● Hoạt động' : '○ Tắt'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !form.name.trim() || !form.slug.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
