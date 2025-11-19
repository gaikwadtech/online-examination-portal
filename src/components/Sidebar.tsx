'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  role: "teacher" | "student";
}

export default function Sidebar() {
  const [role, setRole] = useState<User["role"] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      setRole(user.role);
    }
  }, []);

  if (!role) return null;

  const teacherMenu = [
    { title: "Dashboard", path: "/admin" },
    { title: "Profile", path: "/admin/profile" },
    { title: "Student Management", path: "/admin/student-management" },
    { title: "Exam Management", path: "/admin/exam-management" },
    { title: "Analysis", path: "/admin/analysis" },
  ];

  const studentMenu = [
    { title: "Dashboard", path: "/student" },
    { title: "Profile", path: "student/profile" },
    { title: "Exam", path: "/student/exam" },
    { title: "Result", path: "/student/result" },
    { title: "Analysis", path: "/student/analysis" },
  ];

  const menuItems = role === "teacher" ? teacherMenu : studentMenu;

  return (
    <div className="w-64 h-screen bg-linear-to-b from-gray-800 via-gray-900 to-black text-white p-6 shadow-lg">
      {/* Logo */}
      <h2 className="text-2xl font-bold mb-8 text-yellow-400">Test Edge</h2>

      {/* Menu Items */}
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.path}
              className="block py-3 px-4 rounded-lg bg-gray-700 hover:bg-yellow-500 hover:text-black transition-colors font-medium shadow-md"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>

      
    </div>
  );
}
