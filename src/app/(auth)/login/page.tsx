'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, GraduationCap, School, Home } from 'lucide-react';

// --- Animation Variants ---
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
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
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
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
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

      <Link
        href="/"
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold backdrop-blur-md hover:bg-white/20 transition"
      >
        <Home className="w-4 h-4" />
        Home
      </Link>

      <motion.div
        variants={cardVariants}
        className="relative w-full max-w-4xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row"
      >
        {/* --- Left Side: Visual/Branding --- */}
        <div className="relative w-full md:w-5/12 bg-gradient-to-br from-cyan-900/80 to-blue-900/80 p-10 flex flex-col justify-between text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          {/* Decorative Circle */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-6 h-6 text-cyan-100" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back.</h1>
            <p className="text-cyan-100/80 text-sm leading-relaxed">
              Sign in to access your dashboard, view results, and continue your learning journey.
            </p>
          </div>

          <div className="relative z-10 mt-10 md:mt-0">
             <div className="p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold shadow-lg">
                    TE
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-white">TestEdge Portal</p>
                   <p className="text-xs text-white/60">Secure Access</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* --- Right Side: Form --- */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-slate-950/60">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter your details to proceed.</p>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 mb-6 flex relative">
            {(['student', 'teacher'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200 ${
                  role === r ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r === 'student' ? <GraduationCap className="w-4 h-4" /> : <School className="w-4 h-4" />}
                <span className="capitalize">{r}</span>
              </button>
            ))}
            
            {/* Sliding Background for Active Tab */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-lg bg-slate-800 shadow-sm border border-slate-700/50"
              initial={false}
              animate={{
                left: role === 'student' ? '0.375rem' : '50%',
                width: 'calc(50% - 0.375rem)',
                x: role === 'teacher' ? '0%' : '0%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <InputGroup 
              icon={<Mail className="w-4 h-4" />}
              label="Email Address" 
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <InputGroup 
              icon={<Lock className="w-4 h-4" />}
              label="Password" 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Reusable Input Component ---
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
          {icon}
        </div>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-sm"
          {...props}
        />
      </div>
    </div>
  );
}
