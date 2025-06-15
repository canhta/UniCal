"use client";

import Link from "next/link";
import { CalendarIcon, Cog6ToothIcon, CubeIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import BaseNavbar from "./BaseNavbar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function UserNavbar() {
  const { user } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: CubeIcon },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/integrations", label: "Integrations", icon: Cog6ToothIcon },
    { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  const logo = (
    <Link href="/dashboard" className="flex items-center space-x-2">
      <span className="text-2xl">📅</span>
      <span className="text-xl font-bold text-blue-600">UniCal</span>
    </Link>
  );

  const desktopNav = (
    <>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  const desktopActions = (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        Welcome, {user?.name || user?.email}!
      </span>
      <Button onClick={() => signOut()} variant="outline">
        Sign Out
      </Button>
    </div>
  );

  const mobileNav = (
    <>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
          >
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  const mobileActions = (
    <div className="flex flex-col space-y-2">
      <span className="text-sm text-gray-600 px-2">
        Welcome, {user?.name || user?.email}!
      </span>
      <Button onClick={() => signOut()} variant="outline" className="w-full">
        Sign Out
      </Button>
    </div>
  );

  return (
    <BaseNavbar
      logo={logo}
      desktopNav={desktopNav}
      desktopActions={desktopActions}
      mobileNav={mobileNav}
      mobileActions={mobileActions}
    />
  );
}
