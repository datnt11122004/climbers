import { HttpClient } from './http';

export type TelegramLoginData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type UserProfile = {
  id: number;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
};

type AuthResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: UserProfile;
  };
};

type MeResponse = {
  success: boolean;
  data: UserProfile;
};

export class AuthService {
  static async telegramLogin(data: TelegramLoginData): Promise<{ accessToken: string; user: UserProfile }> {
    const res = await HttpClient.post<AuthResponse>('/auth/telegram', data);
    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', res.data.accessToken);
    }
    return res.data;
  }

  static async getMe(): Promise<UserProfile> {
    const res = await HttpClient.get<MeResponse>('/auth/me');
    return res.data;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  static isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
