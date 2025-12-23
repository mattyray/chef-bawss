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

export default function ChefEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [chefNotes, setChefNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.getEvent(eventId);
        setEvent(data);
        setChefNotes(data.chef_notes || '');
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

  const handleSaveNotes = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateEvent(eventId, { chef_notes: chefNotes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !event) {
    return (
      <ProtectedRoute>
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
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to My Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{event.display_name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Date, Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-gray-900">{event.location || 'Not specified'}</p>
              {event.location && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-sm text-blue-600 hover:text-blue-500"
                >
                  Open in Maps &rarr;
                </a>
              )}
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1 text-gray-900">{event.client_name}</p>
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
            </div>

            {/* Event Details */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{event.guest_count}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Your Pay</h3>
                  <p className="mt-1 text-2xl font-semibold text-green-600">
                    {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Allergies */}
            {(event.allergies || event.client_allergies) && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-red-600 mb-4">Allergies & Dietary Restrictions</h2>
                {event.client_allergies && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">Client Allergies</h3>
                    <p className="mt-1 text-red-700">{event.client_allergies}</p>
                  </div>
                )}
                {event.allergies && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">Event-Specific Allergies</h3>
                    <p className="mt-1 text-red-700">{event.allergies}</p>
                  </div>
                )}
              </div>
            )}

            {/* Menu Notes */}
            {event.menu_notes && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Menu Notes</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{event.menu_notes}</p>
              </div>
            )}

            {/* Chef Notes - Editable */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">My Notes</h2>
              <p className="text-sm text-gray-500 mb-2">
                Add your personal notes for this event (shopping lists, prep notes, etc.)
              </p>
              <textarea
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your notes here..."
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
                {saveSuccess && (
                  <span className="text-green-600 text-sm">Notes saved!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
