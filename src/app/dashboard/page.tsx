'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Fetches user data
        if (!res.ok) {
          router.push('/login'); // If not logged in, go to login
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        router.push('/login'); // On error, go to login
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <h1 className="font-poppins text-2xl font-bold text-secondary-navy">Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <h1 className="font-poppins text-2xl font-bold text-red-600">Could not load user data.</h1>
      </div>
    );
  }

  // THIS IS THE MAIN DASHBOARD
  return (
    <div className="mx-auto max-w-7xl">
      
      {/* --- WELCOME CARD (NO BUTTONS) --- */}
      {/* This card has a white background to make text visible */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500">
        <div>
          <h1 className="font-poppins text-4xl font-bold text-white">
            {/* This is the logic your lead asked for */}
            {user.role === 'teacher' ? 'Welcome Teacher' : 'Welcome Student'}
          </h1>
          <p className="mt-2 text-lg text-white">
            Welcome back, <span className="font-montserrat font-semibold text-primary-blue">{user.name}</span>!
          </p>
        </div>
      </div>
      {/* --- END OF WELCOME CARD --- */}
      
    </div>
  );
}