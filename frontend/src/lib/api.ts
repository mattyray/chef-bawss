const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // If unauthorized, try refreshing token
    if (response.status === 401 && !skipAuth && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      // Handle DRF validation errors (field-based) or detail messages
      let message = 'Request failed';
      if (error.detail) {
        message = error.detail;
      } else if (typeof error === 'object') {
        // Extract first validation error
        const firstKey = Object.keys(error)[0];
        if (firstKey && Array.isArray(error[firstKey])) {
          message = `${firstKey}: ${error[firstKey][0]}`;
        }
      }
      throw new ApiError(response.status, message, error);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ access: string; refresh: string }>(
      '/api/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }
    );
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    business_name: string;
  }) {
    const response = await this.request<{
      user: import('@/types').User;
      tokens: { access: string; refresh: string };
    }>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<import('@/types').User>('/api/auth/me/');
  }

  async getInviteInfo(token: string) {
    return this.request<{
      email: string;
      first_name: string;
      last_name: string;
      organization_name: string;
    }>(`/api/auth/invite-info/?token=${encodeURIComponent(token)}`, {
      skipAuth: true,
    });
  }

  async acceptInvite(token: string, password: string) {
    const response = await this.request<{
      detail: string;
      user: import('@/types').User;
      tokens: { access: string; refresh: string };
    }>('/api/auth/accept-invite/', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  }

  // Clients
  async getClients() {
    return this.request<import('@/types').Client[]>('/api/clients/');
  }

  async getClient(id: number) {
    return this.request<import('@/types').Client>(`/api/clients/${id}/`);
  }

  async createClient(data: Partial<import('@/types').Client>) {
    return this.request<import('@/types').Client>('/api/clients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: Partial<import('@/types').Client>) {
    return this.request<import('@/types').Client>(`/api/clients/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: number) {
    return this.request(`/api/clients/${id}/`, { method: 'DELETE' });
  }

  // Chefs
  async getChefs() {
    return this.request<import('@/types').Chef[]>('/api/chefs/');
  }

  async getChef(id: number) {
    return this.request<import('@/types').Chef>(`/api/chefs/${id}/`);
  }

  async inviteChef(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    default_pay_rate?: number;
    notes?: string;
  }) {
    return this.request<import('@/types').Chef>('/api/chefs/invite/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChef(id: number, data: Partial<import('@/types').Chef>) {
    return this.request<import('@/types').Chef>(`/api/chefs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateChef(id: number) {
    return this.request(`/api/chefs/${id}/deactivate/`, { method: 'POST' });
  }

  async activateChef(id: number) {
    return this.request(`/api/chefs/${id}/activate/`, { method: 'POST' });
  }

  async resendChefInvite(id: number) {
    return this.request<{ detail: string }>(`/api/chefs/${id}/resend-invite/`, { method: 'POST' });
  }

  // Events
  async getEvents(params?: { status?: string; chef_id?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.chef_id) searchParams.set('chef_id', String(params.chef_id));
    const query = searchParams.toString();
    return this.request<import('@/types').Event[]>(`/api/events/${query ? `?${query}` : ''}`);
  }

  async getEvent(id: number) {
    return this.request<import('@/types').Event>(`/api/events/${id}/`);
  }

  async createEvent(data: Partial<import('@/types').Event>) {
    return this.request<import('@/types').Event>('/api/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: number, data: Partial<import('@/types').Event>) {
    return this.request<import('@/types').Event>(`/api/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: number) {
    return this.request(`/api/events/${id}/`, { method: 'DELETE' });
  }

  async completeEvent(id: number) {
    return this.request(`/api/events/${id}/complete/`, { method: 'POST' });
  }

  async cancelEvent(id: number) {
    return this.request(`/api/events/${id}/cancel/`, { method: 'POST' });
  }

  async getCalendarEvents(start: string, end: string, chefId?: number) {
    const params = new URLSearchParams({ start, end });
    if (chefId) params.set('chef_id', String(chefId));
    return this.request<import('@/types').CalendarEvent[]>(`/api/events/calendar/?${params}`);
  }

  // Dashboard
  async getDashboard() {
    return this.request<import('@/types').AdminDashboard | import('@/types').ChefDashboard>(
      '/api/dashboard/'
    );
  }

  // Finances
  async getFinances(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const query = params.toString();
    return this.request<import('@/types').FinancesSummary>(`/api/finances/${query ? `?${query}` : ''}`);
  }

  async getFinancesByChef(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const query = params.toString();
    return this.request<import('@/types').FinancesByChef>(`/api/finances/by-chef/${query ? `?${query}` : ''}`);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
