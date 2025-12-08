"use client";

import React, { useEffect, useState } from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import Sidebar from "@/components/Sidebar";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  role: string;
  photo?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // collapsed defaults to false (this is what server will render)
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // mounted -> only true on client after hydration
  const [mounted, setMounted] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    // run only on client
    setMounted(true);

    // sync collapsed from localStorage (client-only)
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      if (raw === "true") setCollapsed(true);
      else setCollapsed(false);
    } catch {
      // ignore errors
    }

    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const handleStorage = () => loadUser();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-updated", handleStorage as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-updated", handleStorage as EventListener);
    };
  }, [router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
    } catch {}
    router.push("/");
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", next ? "true" : "false");
      } catch {}
      return next;
    });
  };

  // compute left margin to accommodate the fixed sidebar width.
  // Use exact pixel numbers to match the server rendering (server used collapsed=false).
  const mainMarginLeft = mounted ? (collapsed ? 80 : 256) : 256;

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderDashboard user={user} loading={loading} handleLogout={handleLogout} />

      {/* toggle button is rendered only on client after mount to avoid SSR mismatch */}
      {mounted && (
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className="fixed top-20 left-4 z-50 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-2 rounded-full shadow-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          {collapsed ? <AiOutlineMenu size={18} /> : <AiOutlineClose size={18} />}
        </button>
      )}

      <div className="flex flex-1">
        {/* pass collapsed down to Sidebar (server will see collapsed=false) */}
        <Sidebar collapsed={collapsed} />

        <main
          className="flex-1 p-6 bg-gray-100 transition-all duration-300"
          style={{ marginLeft: mainMarginLeft }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}