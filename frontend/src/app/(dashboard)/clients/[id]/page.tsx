'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client, Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const clientId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, eventsData] = await Promise.all([
          api.getClient(clientId),
          api.getEvents(),
        ]);
        setClient(clientData);
        setEvents(eventsData.filter((e: Event) => e.client === clientId));
      } catch (err) {
        setError('Failed to load client');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteClient(clientId);
      router.push('/clients');
    } catch (err) {
      console.error(err);
      alert('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !client) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Client not found'}
        </div>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Sort events: upcoming first (by date asc), then completed/cancelled (by date desc)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    if (a.status === 'upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/clients"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Clients
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex gap-2">
              <Link
                href={`/clients/${clientId}/edit`}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting || events.length > 0}
                className="px-3 sm:px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                title={events.length > 0 ? 'Cannot delete client with events' : ''}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-900">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-500">
                      {client.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-gray-900">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-500">
                      {formatPhoneNumber(client.phone)}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-gray-900">{client.address || '-'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="mt-1 text-gray-900 font-semibold">
                  ${Number(client.total_revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {client.allergies && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                <p className="mt-1 text-gray-900">{client.allergies}</p>
              </div>
            )}

            {client.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            {/* Client History Summary */}
            {events.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">History Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
                    <p className="text-xs text-gray-500">Total Events</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-blue-600">{upcomingEvents.length}</p>
                    <p className="text-xs text-gray-500">Upcoming</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-green-600">{completedEvents.length}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      ${Number(client.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Event History ({events.length})
            </h2>
            <Link
              href="/events/new"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              + New Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No events for this client yet
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="sm:hidden space-y-3">
                {sortedEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="block">
                    <div className="bg-white shadow rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{event.display_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                            {event.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ${Number(event.client_pay).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            {event.display_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Number(event.client_pay).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
