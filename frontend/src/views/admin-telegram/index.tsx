'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { AppStoreSpyService, TelegramBot, TelegramGroupConfig } from '@/services/appstorespy.service';
import {
  Plus, Trash2, Loader2, CheckCircle, XCircle, RefreshCw, Bot, MessageSquare, Save, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NewConfigForm = {
  botId: string;
  chatId: string;
  topicId: string;
  groupName: string;
};

const EMPTY_FORM: NewConfigForm = { botId: '', chatId: '', topicId: '', groupName: '' };

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AdminTelegramView() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [configs, setConfigs] = useState<TelegramGroupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewConfigForm>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [botsData, configsData] = await Promise.all([
        AppStoreSpyService.getBots(),
        AppStoreSpyService.getTelegramConfigs(),
      ]);
      setBots(botsData);
      setConfigs(configsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.botId || !form.chatId) { setError('Bot và Chat ID là bắt buộc.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await AppStoreSpyService.createTelegramConfig({
        botId: Number(form.botId),
        chatId: form.chatId.trim(),
        topicId: form.topicId ? Number(form.topicId) : undefined,
        groupName: form.groupName.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      flash('✅ Đã tạo config mới');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tạo config');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (cfg: TelegramGroupConfig) => {
    try {
      await AppStoreSpyService.updateTelegramConfig(cfg.id, { active: !cfg.active });
      setConfigs(prev => prev.map(c => c.id === cfg.id ? { ...c, active: !c.active } : c));
      flash(`✅ ${cfg.active ? 'Đã tắt' : 'Đã bật'} config #${cfg.id}`);
    } catch (err: any) {
      setError(err?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa config này?')) return;
    try {
      await AppStoreSpyService.deleteTelegramConfig(id);
      setConfigs(prev => prev.filter(c => c.id !== id));
      flash('✅ Đã xóa config');
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi xóa');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-in">
        <Header title="Telegram Config" description="Quản lý bot và group chat nhận thông báo" />
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Hủy' : 'Thêm Config'}
          </button>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#334155] text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-all border border-[#334155]">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Flash messages */}
      {successMsg && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm animate-in">{successMsg}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between"><span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button></div>}

      {/* Create Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 mb-6 animate-in border border-[#6366f1]/20">
          <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#6366f1]" /> Thêm Group Config mới
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Bot *</label>
              <select
                value={form.botId}
                onChange={e => setForm(f => ({ ...f, botId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#6366f1] transition-colors"
                required
              >
                <option value="">Chọn bot</option>
                {bots.map(b => (
                  <option key={b.id} value={b.id}>@{b.name} {b.active ? '✅' : '❌'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Chat ID *</label>
              <input
                type="text"
                value={form.chatId}
                onChange={e => setForm(f => ({ ...f, chatId: e.target.value }))}
                placeholder="-1001234567890"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Topic ID (tùy chọn)</label>
              <input
                type="number"
                value={form.topicId}
                onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))}
                placeholder="ID của topic trong group"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748b] mb-1.5 block">Tên Group (tùy chọn)</label>
              <input
                type="text"
                value={form.groupName}
                onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))}
                placeholder="Tên group để dễ nhận biết"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors disabled:opacity-40"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu Config
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bots Overview */}
      <div className="glass-card rounded-2xl p-5 mb-6 animate-in animate-in-delay-1">
        <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#6366f1]" /> Danh sách Bot ({bots.length})
        </h3>
        {bots.length === 0 ? (
          <p className="text-sm text-[#475569]">Chưa có bot nào</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bots.map(b => (
              <div key={b.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${b.active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#334155]/50 border-[#334155] text-[#64748b]'}`}>
                {b.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                @{b.name}
                {b.interactive && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px]">Interactive</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configs Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-in animate-in-delay-2">
        <div className="p-5 border-b border-[#334155] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#6366f1]" /> Group Configs ({configs.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
          </div>
        ) : configs.length === 0 ? (
          <div className="py-16 text-center text-[#475569] text-sm">Chưa có config nào. Nhấn "Thêm Config" để bắt đầu.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#64748b] text-left border-b border-[#334155] bg-[#0f172a]/50">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Bot</th>
                  <th className="px-4 py-3 font-medium">Chat ID</th>
                  <th className="px-4 py-3 font-medium">Topic ID</th>
                  <th className="px-4 py-3 font-medium">Group Name</th>
                  <th className="px-4 py-3 font-medium text-center">Active</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {configs.map(cfg => (
                  <tr key={cfg.id} className="hover:bg-[#334155]/20 transition-colors">
                    <td className="px-4 py-3 text-[#475569] font-mono text-xs">#{cfg.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bot?.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#334155] text-[#64748b]'}`}>
                        @{cfg.bot?.name ?? `Bot #${cfg.botId}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">{cfg.chatId}</td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{cfg.topicId ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8]">{cfg.groupName ?? <span className="text-[#475569]">—</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(cfg)}
                        className={`w-8 h-5 rounded-full transition-all relative ${cfg.active ? 'bg-[#6366f1]' : 'bg-[#334155]'}`}
                        title={cfg.active ? 'Đang bật – Click để tắt' : 'Đang tắt – Click để bật'}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.active ? 'left-3.5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(cfg.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
