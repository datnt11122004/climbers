'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Mountain, LayoutDashboard, Layers, TrendingUp, Activity, Bell, LogOut, Settings } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { AuthService } from '@/services/auth.service';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navLinks = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    // { href: '/app-categories', icon: Layers, label: 'Theo dõi Dòng App' },
    { href: '/app-tracking', icon: TrendingUp, label: 'Theo dõi App' },
  ];

  const adminLinks = [
    { href: '/admin-categories', icon: Settings, label: 'Quản lý Danh mục' },
    { href: '/store-monitoring', icon: Activity, label: 'AppStoreSpy Monitor' },
    { href: '/notifications', icon: Bell, label: 'Cài đặt Thông báo' },
  ];

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    AuthService.logout();
    dispatch(logout());
    router.replace('/login');
  };

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  const displayName = user
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'User';

  const displaySub = user?.username ? `@${user.username}` : (user?.role || '');

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e293b]/80 backdrop-blur-xl border-r border-[#334155] z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">CLIMBERS</h1>
            <p className="text-xs text-[#64748b]">Market Research Tool</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive ? 'active font-medium' : 'font-medium text-[#94a3b8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">Admin</p>
            </div>
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    isActive ? 'active font-medium' : 'font-medium text-[#94a3b8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#334155]">
        <div className="flex items-center gap-3 px-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white text-sm font-semibold">
              {userInitials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[#f1f5f9]">{displayName}</p>
            <p className="text-xs text-[#64748b]">{displaySub}</p>
          </div>
          <LogOut
            onClick={handleLogout}
            className="w-4 h-4 text-[#64748b] cursor-pointer hover:text-[#f1f5f9] transition-colors"
          />
        </div>
      </div>
    </aside>
  );
}
