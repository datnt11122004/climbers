'use client';

import { Loader2, AlertTriangle, X } from 'lucide-react';

type DeleteConfirmModalProps = {
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

export function DeleteConfirmModal({ categoryName, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md mx-4 animate-in border border-[#334155]">
        {/* Close */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-[#64748b] hover:text-[#f1f5f9] transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#f1f5f9] text-center mb-2">Xác nhận xoá</h3>
        <p className="text-sm text-[#94a3b8] text-center mb-6">
          Bạn có chắc chắn muốn xoá danh mục <span className="text-[#f1f5f9] font-medium">&ldquo;{categoryName}&rdquo;</span>?
          Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1e293b] text-[#94a3b8] border border-[#334155] hover:bg-[#334155] transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
