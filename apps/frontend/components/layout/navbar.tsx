"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import BaseNavbar from "./BaseNavbar";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

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
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        Welcome, {session.user?.name || session.user?.email}!
      </span>
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
        Welcome, {session.user?.name || session.user?.email}!
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
