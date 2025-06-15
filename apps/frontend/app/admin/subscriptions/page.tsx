'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline';

interface Subscription {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
  status: 'Active' | 'Cancelled' | 'Past Due' | 'Trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  'Past Due': 'bg-yellow-100 text-yellow-800',
  Trialing: 'bg-blue-100 text-blue-800',
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [pageInfo.page, searchQuery, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const params = new URLSearchParams({
      //   page: pageInfo.page.toString(),
      //   limit: pageInfo.limit.toString(),
      //   ...(searchQuery && { search: searchQuery }),
      //   ...(statusFilter !== 'all' && { status: statusFilter }),
      // });
      // const response = await fetch(`/api/admin/subscriptions?${params}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          user: {
            id: 'user_1',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
          },
          plan: {
            id: 'plan_pro',
            name: 'Pro Plan',
            price: 29.99,
            interval: 'month',
          },
          status: 'Active',
          currentPeriodStart: '2024-06-01',
          currentPeriodEnd: '2024-07-01',
          createdAt: '2024-01-15',
        },
        {
          id: 'sub_2',
          user: {
            id: 'user_2',
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
          },
          plan: {
            id: 'plan_basic',
            name: 'Basic Plan',
            price: 9.99,
            interval: 'month',
          },
          status: 'Active',
          currentPeriodStart: '2024-06-10',
          currentPeriodEnd: '2024-07-10',
          createdAt: '2024-02-20',
        },
        {
          id: 'sub_3',
          user: {
            id: 'user_3',
            fullName: 'Bob Johnson',
            email: 'bob.johnson@example.com',
          },
          plan: {
            id: 'plan_premium',
            name: 'Premium Plan',
            price: 499.99,
            interval: 'year',
          },
          status: 'Cancelled',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2025-01-01',
          createdAt: '2024-01-01',
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSubscriptions(mockSubscriptions);
      setPageInfo(prev => ({ ...prev, total: mockSubscriptions.length, totalPages: 1 }));
    } catch (err) {
      setError('Failed to load subscriptions');
      console.error('Fetch subscriptions error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement cancel API call
      // await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
      
      // Update local state for now
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: 'Cancelled' as const } : sub
      ));
    } catch (err) {
      console.error('Cancel subscription error:', err);
      alert('Failed to cancel subscription');
    }
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval}`;
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Subscriptions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user subscriptions
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/admin/subscriptions/plans"
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CreditCardIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Manage Plans
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by user or plan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Past Due">Past Due</option>
            <option value="Trialing">Trialing</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={fetchSubscriptions}
            className="mt-2 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.user.fullName}</div>
                          <div className="text-sm text-gray-500">{subscription.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.plan.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(subscription.plan.price, subscription.plan.interval)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[subscription.status]}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/subscriptions/${subscription.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          {subscription.status === 'Active' && (
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Subscription"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {subscriptions.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-500">No subscriptions found</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pageInfo.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pageInfo.page - 1) * pageInfo.limit) + 1} to {Math.min(pageInfo.page * pageInfo.limit, pageInfo.total)} of {pageInfo.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPageInfo(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pageInfo.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPageInfo(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pageInfo.page === pageInfo.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
