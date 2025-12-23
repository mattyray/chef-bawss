'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function formatTime(time: string | null): string {
  if (!time) return '-';
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${m} ${period}`;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.getEvent(eventId);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteEvent(eventId);
      router.push('/events');
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
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

  if (error || !event) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Event not found'}
        </div>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{event.display_name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/events/${eventId}/edit`}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 sm:px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-gray-900 font-medium">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
                <p className="mt-1 text-gray-900">{formatTime(event.start_time)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Time</h3>
                <p className="mt-1 text-gray-900">{formatTime(event.end_time)}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1">
                    <Link href={`/clients/${event.client}`} className="text-blue-600 hover:text-blue-500">
                      {event.client_name}
                    </Link>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_email ? (
                      <a href={`mailto:${event.client_email}`} className="text-blue-600 hover:text-blue-500">
                        {event.client_email}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_phone ? (
                      <a href={`tel:${event.client_phone}`} className="text-blue-600 hover:text-blue-500">
                        {formatPhoneNumber(event.client_phone)}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
              {event.client_allergies && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Client Allergies</h3>
                  <p className="mt-1 text-red-600">{event.client_allergies}</p>
                </div>
              )}
            </div>

            {/* Chef & Event Details */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned Chef</h3>
                  <p className="mt-1 text-gray-900">
                    {event.chef_name ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.chef_color }}
                        />
                        {event.chef_name}
                      </span>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{event.location || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-gray-900">{event.guest_count || '-'}</p>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Financial</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client Pays</h3>
                  <p className="mt-1 text-gray-900 font-semibold text-lg">
                    ${Number(event.client_pay).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Chef Pay</h3>
                  <p className="mt-1 text-gray-900">
                    {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Profit</h3>
                  <p className="mt-1 text-green-600 font-semibold">
                    {event.profit ? `$${Number(event.profit).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deposit</h3>
                  <p className="mt-1 text-gray-900">
                    {event.deposit_amount ? (
                      <span className={event.deposit_received ? 'text-green-600' : ''}>
                        ${Number(event.deposit_amount).toLocaleString()}
                        {event.deposit_received ? ' (Received)' : ' (Pending)'}
                      </span>
                    ) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(event.menu_notes || event.allergies) && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                {event.allergies && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Event Allergies</h3>
                    <p className="mt-1 text-red-600">{event.allergies}</p>
                  </div>
                )}
                {event.menu_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Menu Notes</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.menu_notes}</p>
                  </div>
                )}
              </div>
            )}

            {event.internal_notes && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500">Internal Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.internal_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
