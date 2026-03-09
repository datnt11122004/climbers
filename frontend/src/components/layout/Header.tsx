import React from 'react';
import { Calendar } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

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
        <NotificationDropdown className="z-[100]"/>
        <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-[#94a3b8]">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>
    </header>
  );
}
