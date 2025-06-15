'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'SuperAdmin' | 'Admin';
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
}

interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleColors = {
  SuperAdmin: 'bg-purple-100 text-purple-800',
  Admin: 'bg-blue-100 text-blue-800',
};

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchAdminUsers();
  }, [pageInfo.page, searchQuery, roleFilter]);

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const params = new URLSearchParams({
      //   page: pageInfo.page.toString(),
      //   limit: pageInfo.limit.toString(),
      //   ...(searchQuery && { search: searchQuery }),
      //   ...(roleFilter !== 'all' && { role: roleFilter }),
      // });
      // const response = await fetch(`/api/admin/users/admins?${params}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          fullName: 'Admin SuperUser',
          email: 'superadmin@unical.com',
          role: 'SuperAdmin',
          status: 'Active',
          createdAt: '2024-01-01',
          lastLogin: '2024-06-15',
        },
        {
          id: '2',
          fullName: 'John Admin',
          email: 'john.admin@unical.com',
          role: 'Admin',
          status: 'Active',
          createdAt: '2024-02-15',
          lastLogin: '2024-06-14',
        },
        {
          id: '3',
          fullName: 'Jane Manager',
          email: 'jane.manager@unical.com',
          role: 'Admin',
          status: 'Inactive',
          createdAt: '2024-03-20',
          lastLogin: '2024-05-30',
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUsers(mockUsers);
      setPageInfo(prev => ({ ...prev, total: mockUsers.length, totalPages: 1 }));
    } catch (err) {
      setError('Failed to load admin users');
      console.error('Fetch admin users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'Active' | 'Inactive') => {
    try {
      // TODO: Implement update API call
      // await fetch(`/api/admin/users/admins/${userId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      
      // Update local state for now
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Update user status error:', err);
      alert('Failed to update user status');
    }
  };

  if (isLoading && users.length === 0) {
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
            Admin Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage administrator accounts and permissions (Super Admin only)
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/admin/users/admins/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Admin
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
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="SuperAdmin">Super Admin</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={fetchAdminUsers}
            className="mt-2 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/users/admins/${user.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/admin/users/admins/${user.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit Admin"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          {user.status === 'Active' ? (
                            <button
                              onClick={() => handleUpdateUserStatus(user.id, 'Inactive')}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-600 rounded"
                              title="Deactivate"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUserStatus(user.id, 'Active')}
                              className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-600 rounded"
                              title="Activate"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-500">No admin users found</div>
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
