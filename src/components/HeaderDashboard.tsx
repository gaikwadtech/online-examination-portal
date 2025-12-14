"use client";

import { motion } from "framer-motion";

interface User {
  name: string;
  email: string;
  photo?: string;
}

export default function HeaderDashboard({
  user,
  loading,
  handleLogout,
}: {
  user: User | null;
  loading: boolean;
  handleLogout: () => void;
}) {
  const normalizePhoto = (src?: string) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:")) return src;
    return `/uploads/${src}`;
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="w-full bg-white/90 backdrop-blur shadow-sm py-2 px-6 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/logo111.png" alt="Logo" width={120} height={30} />
      </div>

      {/* AUTH BUTTONS */}
      <div className="flex items-center space-x-4">
        {loading ? (
          <div className="h-10 w-44"></div> // skeleton space while loading
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl opacity-60 bg-gradient-to-br from-blue-200 via-sky-200 to-indigo-200 rounded-full" />
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                {normalizePhoto(user.photo) ? (
                  <img
                    src={normalizePhoto(user.photo)}
                    alt={user.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-700">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* User Name + Email */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-right"
            >
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </motion.div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleLogout}
              className="rounded-full bg-white p-2 shadow-sm hover:bg-gray-100 border border-gray-200"
              aria-label="Logout"
            >
              <img src="/logout.png" alt="Logout" className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Not logged in</p>
        )}
      </div>
    </header>
  );
}
