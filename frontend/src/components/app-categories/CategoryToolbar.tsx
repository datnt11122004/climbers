'use client';

import { Search, Save, Loader2 } from 'lucide-react';

type CategoryToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  followedCount: number;
  totalCount: number;
  onSave: () => void;
  saving: boolean;
  hasChanges: boolean;
};

export function CategoryToolbar({
  searchQuery,
  onSearchChange,
  followedCount,
  totalCount,
  onSave,
  saving,
  hasChanges,
}: CategoryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input
          type="text"
          placeholder="Tìm kiếm category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#6366f1] transition-colors"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Stats badge */}
        <span className="text-xs text-[#94a3b8] bg-[#1e293b] px-3 py-1.5 rounded-full border border-[#334155]">
          Đang theo dõi: <span className="text-[#6366f1] font-semibold">{followedCount}</span> / {totalCount}
        </span>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasChanges
              ? 'bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white hover:shadow-lg hover:shadow-indigo-500/25'
              : 'bg-[#1e293b] text-[#64748b] border border-[#334155] cursor-not-allowed'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu danh sách theo dõi
        </button>
      </div>
    </div>
  );
}
