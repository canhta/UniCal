import { ReactNode } from 'react';
import { UserNavbar } from '@/components/layout';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Auth check is handled by middleware, no need to duplicate here
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* User-specific navigation */}
      <UserNavbar />
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
