'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Client, Chef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Time picker options
const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

// Convert 12-hour to 24-hour format for API
function to24Hour(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

// Convert 24-hour to 12-hour parts
function from24Hour(time: string): { hour: string; minute: string; period: string } {
  if (!time) return { hour: '', minute: '', period: 'PM' };
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return { hour: hour.toString(), minute: m, period };
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    client: '',
    chef: '',
    display_name: '',
    date: '',
    startHour: '',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'PM',
    location: '',
    guest_count: '',
    client_pay: '',
    chef_pay: '',
    status: 'upcoming',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, chefsData] = await Promise.all([
          api.getClients(),
          api.getChefs(),
        ]);
        setClients(clientsData);
        setChefs(chefsData.filter(c => c.is_active));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.createEvent({
        client: Number(form.client),
        chef: form.chef ? Number(form.chef) : undefined,
        display_name: form.display_name,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        client_pay: form.client_pay ? form.client_pay : undefined,
        chef_pay: form.chef_pay ? form.chef_pay : undefined,
        status: form.status,
        notes: form.notes,
      });
      router.push('/events');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Event</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="display_name"
                required
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Birthday Dinner, Corporate Event, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  id="client"
                  required
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No clients yet.{' '}
                    <Link href="/clients/new" className="text-blue-600 hover:text-blue-500">
                      Add a client first
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="chef" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Chef
                </label>
                <select
                  id="chef"
                  value={form.chef}
                  onChange={(e) => setForm({ ...form, chef: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.first_name} {chef.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <select
                  id="start_time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time</option>
                  {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <select
                  id="end_time"
                  required
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time</option>
                  {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Count
                </label>
                <input
                  type="number"
                  id="guest_count"
                  min="1"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="client_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Pays ($)
                </label>
                <input
                  type="number"
                  id="client_pay"
                  min="0"
                  step="0.01"
                  value={form.client_pay}
                  onChange={(e) => setForm({ ...form, client_pay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500.00"
                />
              </div>

              <div>
                <label htmlFor="chef_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Chef Pays ($)
                </label>
                <input
                  type="number"
                  id="chef_pay"
                  min="0"
                  step="0.01"
                  value={form.chef_pay}
                  onChange={(e) => setForm({ ...form, chef_pay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="200.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Menu details, special requests, allergies..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/events"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || clients.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
