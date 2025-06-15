'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
// import { useSession } from 'next-auth/react'; // TODO: Use for role checking
import { 
  HomeIcon, 
  UsersIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiresSuperAdmin?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Client Users', href: '/admin/users/clients', icon: UsersIcon },
  { name: 'Admin Users', href: '/admin/users/admins', icon: UserGroupIcon, requiresSuperAdmin: true },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  // const { data: session } = useSession(); // TODO: Use for role checking
  
  // Check if user is super admin (TODO: implement proper admin role checking)
  // const isSuperAdmin = session?.user?.role === 'SuperAdmin';
  const isSuperAdmin = true; // Temporary - allow all admin features for now

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-white text-xl font-bold">UniCal Admin</h1>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              // Skip admin-only items if user doesn't have permission
              if (item.requiresSuperAdmin && !isSuperAdmin) {
                return null;
              }
              
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}