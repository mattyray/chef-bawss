// User & Auth types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_email_verified: boolean;
  role: 'admin' | 'chef';
  organization_name: string;
  organization_id: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
}

// Client types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  allergies: string;
  notes: string;
  event_count: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

// Chef types
export interface Chef {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  address: string;
  default_pay_rate: string | null;
  calendar_color: string;
  notes: string;
  is_active: boolean;
  event_count: number;
  created_at: string;
  updated_at: string;
}

// Event types
export interface Event {
  id: number;
  display_name: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string | null;
  client: number;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_allergies?: string;
  chef: number | null;
  chef_name: string | null;
  chef_email?: string;
  chef_phone?: string;
  chef_color: string;
  location: string;
  guest_count: number;
  allergies: string;
  menu_notes: string;
  client_pay: string;
  chef_pay: string | null;
  profit?: string;
  deposit_amount: string | null;
  deposit_received: boolean;
  internal_notes?: string;
  chef_notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Calendar event (FullCalendar format)
export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string | null;
  color: string;
  extendedProps: {
    client_name: string;
    chef_name: string | null;
    guest_count: number;
    location: string;
    status: string;
  };
}

// Dashboard types
export interface AdminDashboard {
  stats: {
    revenue: string;
    paid_out: string;
    profit: string;
    event_count: number;
  };
  upcoming_events: DashboardEvent[];
  recent_completed: DashboardEvent[];
}

export interface ChefDashboard {
  earnings: {
    this_month: string;
    this_year: string;
  };
  upcoming_events: DashboardEvent[];
}

export interface DashboardEvent {
  id: number;
  display_name: string;
  date: string;
  start_time?: string;
  end_time?: string;
  client_name: string;
  chef_name?: string | null;
  chef_color?: string;
  location?: string;
  guest_count?: number;
  client_pay?: string;
  chef_pay?: string | null;
}

// Finances types
export interface FinancesSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    revenue: string;
    paid_out: string;
    profit: string;
    event_count: number;
  };
}

export interface FinancesByChef {
  period: {
    start_date: string;
    end_date: string;
  };
  by_chef: ChefFinance[];
}

export interface ChefFinance {
  chef_id: number;
  chef_name: string;
  chef_color: string;
  total_paid: string;
  event_count: number;
}
