'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [pathname]); 

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="w-full bg-white text-black shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-1">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo1.png"
            alt="TestEdge Logo"
            width={160}
            height={40}
            priority
          />
        </Link>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-10 w-44"></div>
          ) : user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-white p-2 shadow-sm hover:bg-gray-100 border border-gray-300"
              >
                <Image
                  src="/logout.png"
                  alt="Logout"
                  width={20}
                  height={20}
                />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
