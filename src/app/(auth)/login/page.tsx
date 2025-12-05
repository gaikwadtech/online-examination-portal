'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Unified login for both Student and Teacher
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        // store the returned user object in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (role === 'teacher') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-600 via-purple-500 to-pink-500 p-6">
      <motion.div
  initial={{ opacity: 0, y: 50, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.7, ease: 'easeOut' }}
  className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8"
>
  <motion.h2
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="text-3xl font-extrabold text-white text-center mb-6 drop-shadow-lg"
  >
    Sign In
  </motion.h2>

  {/* Role Toggle */}
  <div className="flex items-center justify-center mb-6 gap-4">
    <button
      onClick={() => setRole('student')}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
        role === 'student'
          ? 'bg-yellow-400 text-black shadow-md'
          : 'bg-white/40 text-white'
      }`}
    >
      Student
    </button>
    <button
      onClick={() => setRole('teacher')}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
        role === 'teacher'
          ? 'bg-yellow-400 text-black shadow-md'
          : 'bg-white/40 text-white'
      }`}
    >
      Teacher
    </button>
  </div>

  {/* Error Message */}
  {error && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-100 text-red-700 text-sm p-2 rounded-md mb-4 text-center"
    >
      {error}
    </motion.div>
  )}

  {/* Form + Register Link in one flex-col container */}
  <div className="flex flex-col space-y-4">
    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl bg-white/80 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl bg-white/80 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-2xl disabled:opacity-60 transition"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    {/* Register Link */}
    <p className="text-center text-white/90 mt-1 text-sm">
      Don’t have an account?{' '}
      <a href="/register" className="text-yellow-300 font-semibold hover:underline">
        Register
      </a>
    </p>
  </div>
</motion.div>
    </div>
  );
}