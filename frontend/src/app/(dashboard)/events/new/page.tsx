'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Client, Chef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchableSelect, SearchableSelectOption } from '@/components/SearchableSelect';
import { AddClientModal } from '@/components/AddClientModal';

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

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [form, setForm] = useState({
    client: '',
    chef: '',
    display_name: '',
    date: searchParams.get('date') || '',
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

  const clientOptions: SearchableSelectOption[] = useMemo(() => {
    return clients.map((client) => ({
      value: client.id.toString(),
      label: client.name,
      sublabel: client.email || undefined,
    }));
  }, [clients]);

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [...prev, newClient]);
    setForm((prev) => ({ ...prev, client: newClient.id.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const start_time = form.startHour ? to24Hour(form.startHour, form.startMinute, form.startPeriod) : '';
      const end_time = form.endHour ? to24Hour(form.endHour, form.endMinute, form.endPeriod) : '';

      await api.createEvent({
        client: Number(form.client),
        chef: form.chef ? Number(form.chef) : undefined,
        display_name: form.display_name,
        date: form.date,
        start_time,
        end_time: end_time || undefined,
        location: form.location,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        client_pay: form.client_pay ? form.client_pay : undefined,
        chef_pay: form.chef_pay ? form.chef_pay : undefined,
        deposit_amount: form.deposit_amount ? form.deposit_amount : undefined,
        deposit_received: form.deposit_received,
        payment_received: form.payment_received,
        status: form.status as 'upcoming' | 'completed' | 'cancelled',
        allergies: form.allergies,
        menu_notes: form.menu_notes,
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

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">New Event</h1>

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
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                    Client *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    + Add New
                  </button>
                </div>
                <SearchableSelect
                  id="client"
                  required
                  options={clientOptions}
                  value={form.client}
                  onChange={(value) => setForm({ ...form, client: value })}
                  placeholder="Select a client"
                  emptyMessage="No clients yet"
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

        <AddClientModal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onClientCreated={handleClientCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
