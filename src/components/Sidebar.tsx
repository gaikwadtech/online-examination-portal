'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineFileText,
  AiOutlineQuestionCircle,
  AiOutlineBarChart,
} from "react-icons/ai";

interface User {
  name: string;
  email: string;
  role: "teacher" | "student";
}

// <-- NOTE: Sidebar now accepts the collapsed prop
export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [role, setRole] = useState<User["role"] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setRole(user.role);
      } catch {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, []);

  if (!role) return null;

  const teacherMenu = [
    { title: "Dashboard", path: "/admin", icon: <AiOutlineDashboard /> },
    { title: "Profile", path: "/admin/profile", icon: <AiOutlineUser /> },
    { title: "Student Management", path: "/admin/student-management", icon: <AiOutlineTeam /> },
    { title: "Exam Management", path: "/admin/exam-management", icon: <AiOutlineFileText /> },
    { title: "Questions", path: "/admin/questions", icon: <AiOutlineQuestionCircle /> },
    { title: "Analysis", path: "/admin/analysis", icon: <AiOutlineBarChart /> },
  ];

  const studentMenu = [
    { title: "Dashboard", path: "/student", icon: <AiOutlineDashboard /> },
    { title: "Profile", path: "/student/profile", icon: <AiOutlineUser /> },
    { title: "Exam", path: "/student/exam", icon: <AiOutlineFileText /> },
    { title: "Result", path: "/student/result", icon: <AiOutlineBarChart /> },
    { title: "Analysis", path: "/student/analysis", icon: <AiOutlineBarChart /> },
  ];

  const menuItems = role === "teacher" ? teacherMenu : studentMenu;

  const widthClass = collapsed ? "w-20" : "w-64";

  

  return (
    <aside
      className={`${widthClass} fixed top-15 left-0 h-[calc(100vh-64px)] z-40 bg-linear-to-b from-gray-800 via-gray-900 to-black text-white shadow-lg transition-all duration-300`}
    >
      <div className="px-3 py-4 border-b border-gray-700">
        {!collapsed ? (
          <h2 className="text-2xl font-bold text-yellow-400 select-none"></h2>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center text-yellow-400 font-bold"></div>
        )}
      </div>

      <nav className="mt-4 px-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors ${collapsed ? "justify-center" : "pl-4"}`}
                title={item.title}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
}
