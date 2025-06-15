import { ReactNode } from 'react';
import MobileMenuToggle from './MobileMenuToggle';

interface BaseNavbarProps {
  logo: ReactNode;
  desktopNav: ReactNode;
  desktopActions: ReactNode;
  mobileNav: ReactNode;
  mobileActions: ReactNode;
}

export default function BaseNavbar({ 
  logo, 
  desktopNav, 
  desktopActions, 
  mobileNav, 
  mobileActions 
}: BaseNavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            {logo}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {desktopNav}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {desktopActions}
          </div>

          {/* Mobile Menu Toggle and Content */}
          <MobileMenuToggle>
            {mobileNav}
            
            <div className="border-t border-gray-200 pt-4 flex flex-col space-y-2">
              {mobileActions}
            </div>
          </MobileMenuToggle>
        </div>
      </div>
    </nav>
  );
}
