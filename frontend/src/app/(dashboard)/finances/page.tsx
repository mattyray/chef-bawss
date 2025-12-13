'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FinancesSummary, FinancesByChef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function FinancesPage() {
  const [summary, setSummary] = useState<FinancesSummary | null>(null);
  const [byChef, setByChef] = useState<FinancesByChef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryData, chefData] = await Promise.all([
        api.getFinances(dateRange.start_date || undefined, dateRange.end_date || undefined),
        api.getFinancesByChef(dateRange.start_date || undefined, dateRange.end_date || undefined),
      ]);
      setSummary(summaryData);
      setByChef(chefData);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading && !summary) {
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-500">Track revenue and chef payouts</p>
          </div>
        </div>

        <form onSubmit={handleFilter} className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
            {(dateRange.start_date || dateRange.end_date) && (
              <button
                type="button"
                onClick={() => {
                  setDateRange({ start_date: '', end_date: '' });
                  setTimeout(fetchData, 0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${Number(summary.summary.revenue).toLocaleString()}`}
            />
            <StatCard
              title="Paid to Chefs"
              value={`$${Number(summary.summary.paid_out).toLocaleString()}`}
            />
            <StatCard
              title="Profit"
              value={`$${Number(summary.summary.profit).toLocaleString()}`}
            />
            <StatCard
              title="Total Events"
              value={summary.summary.event_count.toString()}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Earnings by Chef</h2>
          </div>
          {!byChef || byChef.by_chef.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No earnings data available for the selected period
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byChef.by_chef.map((chef) => (
                  <tr key={chef.chef_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: chef.chef_color || '#E5E7EB' }}
                          >
                            <span className="text-xs font-medium text-white">
                              {chef.chef_name?.split(' ').map(n => n[0]).join('') || '??'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {chef.chef_name || 'Unknown Chef'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chef.event_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${Number(chef.total_paid).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
