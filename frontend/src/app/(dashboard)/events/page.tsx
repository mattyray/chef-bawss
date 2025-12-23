'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Event } from '@/types';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = search === '' ||
        event.display_name.toLowerCase().includes(search.toLowerCase()) ||
        event.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (event.chef_name && event.chef_name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isAdmin ? 'Events' : 'My Events'}
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            {isAdmin ? 'Manage all events' : 'View your assigned events'}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/events/new"
            className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            + New Event
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events, clients, or chefs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {events.length === 0 ? 'No events found' : 'No events match your search'}
          </p>
          {events.length === 0 && isAdmin && (
            <Link
              href="/events/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Create your first event
            </Link>
          )}
          {events.length > 0 && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={isAdmin ? `/events/${event.id}` : `/events/${event.id}/chef-view`} className="block">
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{event.display_name}</h3>
                      <p className="text-sm text-gray-500">{event.client_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.start_time && ` at ${event.start_time}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                      {isAdmin && event.client_pay && (
                        <span className="text-sm font-medium text-gray-900">
                          ${Number(event.client_pay).toLocaleString()}
                        </span>
                      )}
                      {!isAdmin && event.chef_pay && (
                        <span className="text-sm font-medium text-green-600">
                          ${Number(event.chef_pay).toLocaleString()}
                        </span>
                      )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Pay
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.display_name}</div>
                      {event.chef_name && (
                        <div className="text-sm text-gray-500">Chef: {event.chef_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.start_time} - {event.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                    </td>
                    {isAdmin ? (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.client_pay ? `$${Number(event.client_pay).toLocaleString()}` : '-'}
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={isAdmin ? `/events/${event.id}` : `/events/${event.id}/chef-view`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="ml-4 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
