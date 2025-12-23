'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Client, Chef, Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchableSelect, SearchableSelectOption } from '@/components/SearchableSelect';

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
function from24Hour(time: string | null): { hour: string; minute: string; period: string } {
  if (!time) return { hour: '', minute: '00', period: 'PM' };
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  // Round minute to nearest 15
  const mins = parseInt(m);
  const roundedMin = Math.round(mins / 15) * 15;
  const minute = roundedMin === 60 ? '00' : roundedMin.toString().padStart(2, '0');
  return { hour: hour.toString(), minute, period };
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);

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
    deposit_amount: '',
    deposit_received: false,
    payment_received: false,
    status: 'upcoming',
    allergies: '',
    menu_notes: '',
  });

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, clientsData, chefsData] = await Promise.all([
          api.getEvent(eventId),
          api.getClients(),
          api.getChefs(),
        ]);

        const startTime = from24Hour(eventData.start_time);
        const endTime = from24Hour(eventData.end_time);

        setForm({
          client: eventData.client.toString(),
          chef: eventData.chef?.toString() || '',
          display_name: eventData.name || '',
          date: eventData.date,
          startHour: startTime.hour,
          startMinute: startTime.minute,
          startPeriod: startTime.period,
          endHour: endTime.hour,
          endMinute: endTime.minute,
          endPeriod: endTime.period,
          location: eventData.location || '',
          guest_count: eventData.guest_count?.toString() || '',
          client_pay: eventData.client_pay || '',
          chef_pay: eventData.chef_pay || '',
          deposit_amount: eventData.deposit_amount || '',
          deposit_received: eventData.deposit_received || false,
          payment_received: eventData.payment_received || false,
          status: eventData.status,
          allergies: eventData.allergies || '',
          menu_notes: eventData.menu_notes || '',
        });

        setClients(clientsData);
        setChefs(chefsData.filter((c: Chef) => c.is_active));
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const clientOptions: SearchableSelectOption[] = useMemo(() => {
    return clients.map((client) => ({
      value: client.id.toString(),
      label: client.name,
      sublabel: client.email || undefined,
    }));
  }, [clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const start_time = form.startHour ? to24Hour(form.startHour, form.startMinute, form.startPeriod) : '';
      const end_time = form.endHour ? to24Hour(form.endHour, form.endMinute, form.endPeriod) : '';

      await api.updateEvent(eventId, {
        client: Number(form.client),
        chef: form.chef ? Number(form.chef) : null,
        name: form.display_name,
        date: form.date,
        start_time,
        end_time: end_time || null,
        location: form.location,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        client_pay: form.client_pay ? form.client_pay : undefined,
        chef_pay: form.chef_pay ? form.chef_pay : null,
        deposit_amount: form.deposit_amount ? form.deposit_amount : null,
        deposit_received: form.deposit_received,
        payment_received: form.payment_received,
        status: form.status as 'upcoming' | 'completed' | 'cancelled',
        allergies: form.allergies,
        menu_notes: form.menu_notes,
      });
      router.push(`/events/${eventId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
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
            href={`/events/${eventId}`}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Event
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Edit Event</h1>

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
                <SearchableSelect
                  id="client"
                  required
                  options={clientOptions}
                  value={form.client}
                  onChange={(value) => setForm({ ...form, client: value })}
                  placeholder="Select a client"
                  emptyMessage="No clients available"
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <div className="flex gap-1">
                  <select
                    required
                    value={form.startHour}
                    onChange={(e) => setForm({ ...form, startHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.startMinute}
                    onChange={(e) => setForm({ ...form, startMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.startPeriod}
                    onChange={(e) => setForm({ ...form, startPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="flex gap-1">
                  <select
                    value={form.endHour}
                    onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.endMinute}
                    onChange={(e) => setForm({ ...form, endMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.endPeriod}
                    onChange={(e) => setForm({ ...form, endPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
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

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  id="guest_count"
                  min="1"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="client_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Client $
                </label>
                <input
                  type="number"
                  id="client_pay"
                  min="0"
                  step="0.01"
                  value={form.client_pay}
                  onChange={(e) => setForm({ ...form, client_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="chef_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Chef $
                </label>
                <input
                  type="number"
                  id="chef_pay"
                  min="0"
                  step="0.01"
                  value={form.chef_pay}
                  onChange={(e) => setForm({ ...form, chef_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="200"
                />
              </div>

              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit $
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  min="0"
                  step="0.01"
                  value={form.deposit_amount}
                  onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {form.deposit_amount && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deposit_received"
                    checked={form.deposit_received}
                    onChange={(e) => setForm({ ...form, deposit_received: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deposit_received" className="ml-2 text-sm text-gray-700">
                    Deposit received
                  </label>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="payment_received"
                  checked={form.payment_received}
                  onChange={(e) => setForm({ ...form, payment_received: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="payment_received" className="ml-2 text-sm text-gray-700">
                  Paid in full
                </label>
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
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies / Dietary Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Nut allergy, Gluten-free, Vegetarian..."
              />
            </div>

            <div>
              <label htmlFor="menu_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Menu / Notes
              </label>
              <textarea
                id="menu_notes"
                rows={3}
                value={form.menu_notes}
                onChange={(e) => setForm({ ...form, menu_notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Menu details, special requests..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href={`/events/${eventId}`}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
