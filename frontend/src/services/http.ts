const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

export class HttpClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private static buildHeaders(custom?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...custom,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, API_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return url.toString();
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Request failed', data);
    }
    return data;
  }

  static async get<T = any>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildUrl(path, options?.params), {
      method: 'GET',
      headers: this.buildHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }

  static async post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildUrl(path, options?.params), {
      method: 'POST',
      headers: this.buildHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildUrl(path, options?.params), {
      method: 'PATCH',
      headers: this.buildHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildUrl(path, options?.params), {
      method: 'PUT',
      headers: this.buildHeaders(options?.headers),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T = any>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildUrl(path, options?.params), {
      method: 'DELETE',
      headers: this.buildHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
