'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/hooks/useAuth';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'lead';
}

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Implement API call to backend search endpoint
      // const response = await fetch(`/api/admin/search/clients?query=${encodeURIComponent(query)}`);
      // const data = await response.json();
      // setSearchResults(data.results || []);
      setSearchResults([]); // Placeholder
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onBlur={() => {
                // Delay hiding results to allow for clicking
                setTimeout(() => setShowSearchResults(false), 200);
              }}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {isSearching ? (
                <div className="px-4 py-2 text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <a
                    key={index}
                    href={`/admin/users/clients/${result.id}`}
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-sm text-gray-500">{result.email}</div>
                  </a>
                ))
              ) : searchQuery.trim() ? (
                <div className="px-4 py-2 text-gray-500">No results found</div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.name || user?.email || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500">
                {/* TODO: Show admin role */}
                Administrator
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
