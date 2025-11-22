'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: 'student' }), // Role fixed as 'student'
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
      } else {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-600 via-blue-400 to-purple-500 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/20 p-10 rounded-2xl shadow-2xl border border-white/30"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-3xl font-extrabold text-white drop-shadow-lg"
        >
          Create an Account
        </motion.h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="text-white font-medium">Full Name</label>
            <input
              className="mt-1 w-full p-3 rounded-lg bg-white/80 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </motion.div>

          {/* Email */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <label className="text-white font-medium">Email</label>
            <input
              className="mt-1 w-full p-3 rounded-lg bg-white/80 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <label className="text-white font-medium">Password</label>
            <input
              className="mt-1 w-full p-3 rounded-lg bg-white/80 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </motion.div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-2xl disabled:opacity-60"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </motion.button>
        </form>

        {/* Error / Success */}
        {error && <p className="mt-4 text-center text-red-300">{error}</p>}
        {success && <p className="mt-4 text-center text-green-200">{success}</p>}

        {/* Login Redirect */}
        <p className="mt-6 text-center text-white/90">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-300 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
