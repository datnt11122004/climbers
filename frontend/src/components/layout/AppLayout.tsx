'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { AuthService } from '@/services/auth.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, setLoading, logout } from '@/store/slices/authSlice';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  // Check existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      if (!token) {
        dispatch(setLoading(false));
        return;
      }
      try {
        const user = await AuthService.getMe();
        dispatch(setUser(user));
      } catch {
        AuthService.logout();
        dispatch(logout());
      }
    };
    checkAuth();
  }, [dispatch]);

  // Redirect to login if not authenticated (except login page)
  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  // Login page: no layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="font-sans text-[#f1f5f9] min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="font-sans text-[#f1f5f9] min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
