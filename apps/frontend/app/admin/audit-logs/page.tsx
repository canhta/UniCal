'use client';

import { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  timestamp: string;
  performingAdminUser: {
    id: string;
    fullName: string;
    email: string;
  };
  actionType: string;
  affectedEntityType: string;
  affectedEntityId: string;
  details: Record<string, unknown>;
}

interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionTypeColors: Record<string, string> = {
  CREATE_CLIENT_USER: 'bg-green-100 text-green-800',
  UPDATE_CLIENT_USER: 'bg-blue-100 text-blue-800',
  DELETE_CLIENT_USER: 'bg-red-100 text-red-800',
  CREATE_ADMIN_USER: 'bg-purple-100 text-purple-800',
  UPDATE_ADMIN_ROLE: 'bg-yellow-100 text-yellow-800',
  UPDATE_ADMIN_STATUS: 'bg-orange-100 text-orange-800',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [pageInfo.page, searchQuery, dateFrom, dateTo, adminFilter]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const params = new URLSearchParams({
      //   page: pageInfo.page.toString(),
      //   limit: pageInfo.limit.toString(),
      //   ...(searchQuery && { search: searchQuery }),
      //   ...(dateFrom && { dateFrom }),
      //   ...(dateTo && { dateTo }),
      //   ...(adminFilter && { adminUserId: adminFilter }),
      // });
      // const response = await fetch(`/api/admin/audit-logs?${params}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-06-15T10:30:00Z',
          performingAdminUser: {
            id: '1',
            fullName: 'Admin SuperUser',
            email: 'superadmin@unical.com',
          },
          actionType: 'CREATE_CLIENT_USER',
          affectedEntityType: 'ClientUser',
          affectedEntityId: 'user_123',
          details: {
            userEmail: 'newuser@example.com',
            userFullName: 'New User',
          },
        },
        {
          id: '2',
          timestamp: '2024-06-15T09:15:00Z',
          performingAdminUser: {
            id: '2',
            fullName: 'John Admin',
            email: 'john.admin@unical.com',
          },
          actionType: 'UPDATE_CLIENT_USER',
          affectedEntityType: 'ClientUser',
          affectedEntityId: 'user_456',
          details: {
            oldStatus: 'Active',
            newStatus: 'Suspended',
            reason: 'Policy violation',
          },
        },
        {
          id: '3',
          timestamp: '2024-06-14T16:45:00Z',
          performingAdminUser: {
            id: '1',
            fullName: 'Admin SuperUser',
            email: 'superadmin@unical.com',
          },
          actionType: 'CREATE_ADMIN_USER',
          affectedEntityType: 'AdminUser',
          affectedEntityId: 'admin_789',
          details: {
            adminEmail: 'newadmin@unical.com',
            adminRole: 'Admin',
          },
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLogs(mockLogs);
      setPageInfo(prev => ({ ...prev, total: mockLogs.length, totalPages: 1 }));
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Fetch audit logs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  if (isLoading && logs.length === 0) {
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
            Audit Logs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track administrative actions and system changes
          </p>
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
              placeholder="Search actions or entities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              id="dateFrom"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              id="dateTo"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="admin" className="block text-sm font-medium text-gray-700">
            Admin User
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="admin"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Admin email or name"
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={fetchAuditLogs}
            className="mt-2 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Audit Logs List */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => {
              const { date, time } = formatTimestamp(log.timestamp);
              return (
                <li key={log.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${actionTypeColors[log.actionType] || 'bg-gray-100 text-gray-800'}`}>
                            {formatActionType(log.actionType)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            on {log.affectedEntityType}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-900">
                            Performed by <strong>{log.performingAdminUser.fullName}</strong> ({log.performingAdminUser.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            Entity ID: {log.affectedEntityId}
                          </p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2">
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                  View Details
                                </summary>
                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{date}</div>
                      <div className="text-sm text-gray-500">{time}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          
          {logs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-500">No audit logs found</div>
            </div>
          )}
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
