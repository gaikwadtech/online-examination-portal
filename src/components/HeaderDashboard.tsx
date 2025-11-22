"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

interface User {
  name: string;
  email: string;
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
  return (
    <header className="w-full bg-white shadow-sm py-1 px-6 flex justify-between items-center sticky top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src="/logo111.png" alt="Logo" width={120} height={30} />
      </div>

      {/* AUTH BUTTONS */}
      <div className="flex items-center space-x-4">
        {loading ? (
          <div className="h-10 w-44"></div> // skeleton space while loading
        ) : user ? (
          <>
            {/* User Name + Email */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </motion.div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="rounded-md bg-white p-2 shadow-sm hover:bg-gray-100 border border-gray-300"
            >
              <Image src="/logout.png" alt="Logout" width={20} height={20} />
            </motion.button>
          </>
        ) : (
          <>
            {/* When no user is logged in */}
            <p className="text-sm text-gray-600">Not logged in</p>
          </>
        )}
      </div>
    </header>
  );
}
