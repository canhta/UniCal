'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  UsersIcon, 
  UserPlusIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalClientUsers: number;
  newRegistrationsLast7Days: number;
  activeSubscriptions: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  linkHref: string;
  linkText: string;
}

function StatCard({ title, value, icon: Icon, linkHref, linkText }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value.toLocaleString()}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-blue-700 hover:text-blue-900">
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientUsers: 0,
    newRegistrationsLast7Days: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call to backend
      // const response = await fetch('/api/admin/dashboard/stats');
      // const data = await response.json();
      
      // Mock data for now
      const mockData: DashboardStats = {
        totalClientUsers: 1247,
        newRegistrationsLast7Days: 23,
        activeSubscriptions: 892,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockData);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchDashboardStats}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Client Users"
            value={stats.totalClientUsers}
            icon={UsersIcon}
            linkHref="/admin/users/clients"
            linkText="View all client users"
          />
          <StatCard
            title="New Registrations (7 days)"
            value={stats.newRegistrationsLast7Days}
            icon={UserPlusIcon}
            linkHref="/admin/users/clients?filter=recent"
            linkText="View recent registrations"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={CreditCardIcon}
            linkHref="/admin/subscriptions"
            linkText="View subscriptions"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/users/clients"
            className="relative block w-full border border-gray-300 rounded-lg p-6 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div className="flex items-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
              <span className="ml-3 block text-sm font-medium text-gray-900">
                Manage Client Users
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              View, create, and manage client user accounts
            </p>
          </Link>
          
          <Link
            href="/admin/users/admins"
            className="relative block w-full border border-gray-300 rounded-lg p-6 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div className="flex items-center">
              <UserPlusIcon className="h-6 w-6 text-green-600" />
              <span className="ml-3 block text-sm font-medium text-gray-900">
                Manage Admin Users
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              View and manage administrator accounts
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
