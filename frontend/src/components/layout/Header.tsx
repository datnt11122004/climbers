import React from 'react';
import { Calendar, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 animate-in">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-[#94a3b8] text-sm mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-[#94a3b8] cursor-pointer hover:text-[#f1f5f9] transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </div>
        <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-[#94a3b8]">
          <Calendar className="w-4 h-4" />
          <span>26/02/2026</span>
        </div>
      </div>
    </header>
  );
}
