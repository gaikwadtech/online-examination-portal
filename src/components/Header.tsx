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

  // Fetch user info from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/'); // redirect to login
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white text-black shadow-md sticky top-0 z-50 backdrop-blur-lg bg-opacity-80"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-2">

        {/* LOGO */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/" className="flex items-center">
            <Image
              src="/logo111.png"
              className="w-32 translate-x-5"
              alt="TestEdge Logo"
              width={160}
              height={40}
              priority
            />
          </Link>
        </motion.div>

        {/* NAV LINKS */}
        <div className="flex items-center space-x-8 text-sm font-medium">
  {['/', '/about', '/features', '/pricing'].map((link, idx) => (
    <motion.div key={idx} whileHover={{ scale: 1.1 }}>
      <Link
        href={link === '/' ? '/' : link}
        className={`hover:text-blue-600 ${
          pathname === link ? 'border-b-2 border-blue-600 pb-1' : ''
        }`}
      >
        {link === '/' ? 'Home' :
         link === '/about' ? 'About' :
         link === '/features' ? 'Features' :
         'Pricing'}
      </Link>
    </motion.div>
  ))}
</div>

        {/* AUTH / USER BUTTONS */}
        {!loading && !user && (
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 -translate-x-5"
              >
                Sign Up
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                href="/login"
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 -translate-x-5"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        )}

    
      

      </nav>
    </motion.header>
  );
}
