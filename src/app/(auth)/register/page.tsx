'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, GraduationCap, Users, ArrowRight, Loader2, Home 
} from 'lucide-react';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] } 
  },
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
    group: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulating API call for design demo purposes
      // Replace with your actual fetch call
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
      } else {
        setSuccess('Account created successfully!');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full bg-[#0f172a] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden"
    >
      {/* --- Background Effects --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[80px] mix-blend-screen" />

      <Link
        href="/"
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold backdrop-blur-md hover:bg-white/20 transition"
      >
        <Home className="w-4 h-4" />
        Home
      </Link>

      <motion.div
        variants={cardVariants}
        className="relative w-full max-w-5xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row"
      >
        {/* --- Left Side: Visual/Branding --- */}
        <div className="relative w-full md:w-2/5 bg-gradient-to-br from-indigo-600/90 to-purple-700/90 p-10 flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Start your journey.</h1>
            <p className="text-indigo-100/80 text-sm leading-relaxed">
              Join TestEdge today to track your progress, compete with peers, and unlock your true potential.
            </p>
          </div>

          <div className="relative z-10 mt-10 md:mt-0">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-xs font-medium text-indigo-200 mb-1">CURRENT STATUS</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Registrations Open for 2025
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="w-full md:w-3/5 p-8 md:p-10 bg-slate-950/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your details to setup your student profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup 
                icon={<User className="w-4 h-4" />}
                label="Full Name" 
                name="name" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <InputGroup 
                icon={<Mail className="w-4 h-4" />}
                label="Email Address" 
                name="email" 
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup 
                icon={<Phone className="w-4 h-4" />}
                label="Phone" 
                name="phone" 
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
              <InputGroup 
                icon={<Users className="w-4 h-4" />}
                label="Group / Batch" 
                name="group" 
                placeholder="Batch 2025"
                value={formData.group}
                onChange={handleChange}
              />
            </div>

            {/* College - Full Width */}
            <InputGroup 
              icon={<GraduationCap className="w-4 h-4" />}
              label="College / Institution" 
              name="college" 
              placeholder="Institute Name"
              value={formData.college}
              onChange={handleChange}
            />

            {/* Row 3: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup 
                icon={<Lock className="w-4 h-4" />}
                label="Password" 
                name="password" 
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <InputGroup 
                icon={<Lock className="w-4 h-4" />}
                label="Confirm Password" 
                name="confirmPassword" 
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Feedback Messages */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center">
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <p className="text-center text-slate-400 text-sm mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper Component for Cleaner JSX
interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}

function InputGroup({ label, icon, ...props }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {icon}
        </div>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
          {...props}
        />
      </div>
    </div>
  );
}
