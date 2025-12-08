'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface User {
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-white text-black shadow-md sticky top-0 z-50"
    >
      <nav className="mx-auto flex max-w-7xl items-center py-2 px-4">

        {/* LEFT SIDE — LOGO */}
        <div className="grow">
          <Link href="/">
            <Image
              src="/logo111.png"
              alt="TestEdge Logo"
              width={130}
              height={35}
              className="w-28"
              priority
            />
          </Link>
        </div>

        {/* RIGHT SIDE — NAV LINKS + AUTH BUTTONS */}
        <div className="flex items-center gap-8">

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/features', label: 'Features' },
              { href: '/pricing', label: 'Pricing' },
            ].map((item) => (
              <motion.div key={item.href} whileHover={{ scale: 1.05 }}>
                <Link
                  href={item.href}
                  className={`hover:text-blue-600 ${
                    pathname === item.href ? 'border-b-2 border-blue-600 pb-1' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* AUTH BUTTONS */}
          {!loading && !user && (
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign Up
              </Link>

              <Link
                href="/login"
                className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </nav>
    </motion.header>
  );
}
