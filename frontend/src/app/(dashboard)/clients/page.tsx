'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client } from '@/types';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await api.getClients();
        setClients(data);
      } catch (err) {
        setError('Failed to load clients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const searchLower = search.toLowerCase();
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(search) ||
      client.address?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 hidden sm:block">Manage your client list</p>
          </div>
          <Link
            href="/clients/new"
            className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            + Add Client
          </Link>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search clients by name, email, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {clients.length === 0 ? 'No clients found' : 'No clients match your search'}
            </p>
            {clients.length === 0 && (
              <Link
                href="/clients/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                Add your first client
              </Link>
            )}
            {clients.length > 0 && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden space-y-3">
              {filteredClients.map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`} className="block">
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                        {client.phone && <p className="text-sm text-gray-500">{formatPhoneNumber(client.phone)}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${Number(client.total_revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{client.event_count || 0} events</p>
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.email}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{formatPhoneNumber(client.phone)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {client.address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.event_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(client.total_revenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/clients/${client.id}/edit`}
                          className="ml-4 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
