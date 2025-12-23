'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { AdminDashboard, ChefDashboard, DashboardEvent } from '@/types';
import Link from 'next/link';

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function EventCard({ event }: { event: DashboardEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{event.display_name}</h3>
            <p className="text-sm text-gray-500">{event.client_name}</p>
          </div>
          {event.chef_color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: event.chef_color }}
              title={event.chef_name || 'No chef assigned'}
            />
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          {event.start_time && <p>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</p>}
        </div>
        {event.client_pay && (
          <p className="mt-2 text-sm font-medium text-gray-900">
            ${Number(event.client_pay).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [chefData, setChefData] = useState<ChefDashboard | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        if (isAdmin) {
          setAdminData(data as AdminDashboard);
        } else {
          setChefData(data as ChefDashboard);
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (isAdmin && adminData) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.first_name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/events/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Event
            </Link>
            <Link
              href="/clients/new"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              + New Client
            </Link>
            <Link
              href="/chefs"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              + Invite Chef
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${Number(adminData.stats.revenue).toLocaleString()}`}
          />
          <StatCard
            title="Paid to Chefs"
            value={`$${Number(adminData.stats.paid_out).toLocaleString()}`}
          />
          <StatCard
            title="Profit"
            value={`$${Number(adminData.stats.profit).toLocaleString()}`}
          />
          <StatCard
            title="Total Events"
            value={adminData.stats.event_count.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link href="/events" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            {adminData.upcoming_events.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {adminData.upcoming_events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently Completed</h2>
            </div>
            {adminData.recent_completed.length === 0 ? (
              <p className="text-gray-500 text-sm">No recently completed events</p>
            ) : (
              <div className="space-y-4">
                {adminData.recent_completed.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (chefData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.first_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Earnings This Month"
            value={`$${Number(chefData.earnings.this_month).toLocaleString()}`}
          />
          <StatCard
            title="Earnings This Year"
            value={`$${Number(chefData.earnings.this_year).toLocaleString()}`}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Upcoming Events</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          {chefData.upcoming_events.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefData.upcoming_events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
