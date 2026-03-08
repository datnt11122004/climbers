'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mountain } from 'lucide-react';
import { TelegramLoginButton, TelegramUser } from '@/components/auth/TelegramLoginButton';
import { AuthService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'SteamyClimberBot';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect
    console.log('Checking login status on mount...');
    console.log("Bot Name:", BOT_NAME);
    if (AuthService.isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    try {
      const { accessToken, user } = await AuthService.telegramLogin(telegramUser);
      dispatch(setCredentials({ user, token: accessToken }));
      router.replace('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full mx-4 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center">
            <Mountain className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold gradient-text mb-2">CLIMBERS</h1>
        <p className="text-[#94a3b8] text-sm mb-8">
          Market Research Tool — Đăng nhập để tiếp tục
        </p>

        {/* Telegram Login Widget */}
        <div className="flex justify-center mb-6">
          <TelegramLoginButton
            botName={BOT_NAME}
            onAuth={handleTelegramAuth}
            buttonSize="large"
            cornerRadius={8}
          />
        </div>

        <p className="text-xs text-[#64748b]">
          Sử dụng tài khoản Telegram để đăng nhập an toàn
        </p>
      </div>
    </div>
  );
}
