"use client";

import React, { useEffect, useState } from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login"); // 🚀 prevent showing dashboard when pressing back button
      return;
    }

    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/"); // 🚀 go to home page, not login page
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderDashboard user={user} loading={loading} handleLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
