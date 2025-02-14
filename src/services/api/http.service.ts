
import { environment } from '@/config/environment';

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
};

export class HttpService {
  private static instance: HttpService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = environment.api.baseUrl;
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const token = localStorage.getItem(environment.auth.tokenKey);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }
    return response.json();
  }

  public async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    let url = `${this.baseUrl}/${environment.api.version}/${endpoint}`;
    
    // Add query parameters if they exist
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...Object.fromEntries(headers.entries()),
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  public async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpService = HttpService.getInstance();
