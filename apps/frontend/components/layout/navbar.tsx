"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import BaseNavbar from "./BaseNavbar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Navbar() {
  const authState = useAuth();
  const isAuthenticated = authState.isAuthenticated;

  const publicNavItems = [
    { href: "/", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#about", label: "About" },
  ];

  const logo = (
    <Link href="/" className="flex items-center space-x-2">
      <span className="text-2xl">📅</span>
      <span className="text-xl font-bold text-blue-600">UniCal</span>
    </Link>
  );

  const desktopNav = (
    <>
      {publicNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  const desktopActions = isAuthenticated ? (
    <div className="flex items-center space-x-4">        <div className="flex flex-col text-right">
          <span className="text-sm text-gray-600">
            Welcome, {authState.user?.name || authState.user?.email}!
          </span>
          {authState.isLoading ? (
            <span className="text-xs text-yellow-600">Connecting...</span>
          ) : authState.hasUniCalTokens ? (
            <span className="text-xs text-green-600">✓ UniCal Connected</span>
          ) : (
            <span className="text-xs text-red-600">⚠ Connection Failed</span>
          )}
        </div>
      <Link href="/dashboard">
        <Button variant="outline">Dashboard</Button>
      </Link>
      <Button onClick={() => signOut()} variant="outline">
        Sign Out
      </Button>
    </div>
  ) : (
    <div className="flex items-center space-x-2">
      <Link href="/login">
        <Button variant="outline">Sign In</Button>
      </Link>
      <Link href="/register">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );

  const mobileNav = (
    <>
      {publicNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  const mobileActions = isAuthenticated ? (
    <div className="flex flex-col space-y-2">
      <span className="text-sm text-gray-600 px-2">
        Welcome, {authState.user?.name || authState.user?.email}!
      </span>
      <Link href="/dashboard">
        <Button variant="outline" className="w-full">Dashboard</Button>
      </Link>
      <Button onClick={() => signOut()} variant="outline" className="w-full">
        Sign Out
      </Button>
    </div>
  ) : (
    <div className="flex flex-col space-y-2">
      <Link href="/login">
        <Button variant="outline" className="w-full">Sign In</Button>
      </Link>
      <Link href="/register">
        <Button className="w-full">Sign Up</Button>
      </Link>
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
