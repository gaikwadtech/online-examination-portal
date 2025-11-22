'use client';

import React, { useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-black">My Profile</h1>
      <div className="bg-white p-6 rounded shadow-md max-w-md text-black">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </div>
  );
}
