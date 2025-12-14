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

type Role = "teacher" | "student";
interface User {
  name: string;
  email: string;
  role: Role;
  photo?: string;
}

// <-- NOTE: Sidebar now accepts the collapsed prop
export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [role, setRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const loadRole = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          setRole(user.role as Role);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoadingRole(false);
    };

    loadRole();
    const handle = () => loadRole();
    window.addEventListener("storage", handle);
    window.addEventListener("user-updated", handle as EventListener);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("user-updated", handle as EventListener);
    };
  }, []);

  const teacherMenu = [
    { title: "Dashboard", path: "/admin", icon: <AiOutlineDashboard /> },
    { title: "Profile", path: "/admin/profile", icon: <AiOutlineUser /> },
    { title: "Student Management", path: "/admin/student-management", icon: <AiOutlineTeam /> },
    { title: "Exam Management", path: "/admin/exam-management", icon: <AiOutlineFileText /> },
    { title: "Questions", path: "/admin/questions", icon: <AiOutlineQuestionCircle /> },
  ];

  const studentMenu = [
    { title: "Dashboard", path: "/student", icon: <AiOutlineDashboard /> },
    { title: "Profile", path: "/student/profile", icon: <AiOutlineUser /> },
    { title: "Exam", path: "/student/exam", icon: <AiOutlineFileText /> },
    { title: "Result", path: "/student/result", icon: <AiOutlineBarChart /> },
  ];

  const menuItems = role === "teacher" ? teacherMenu : studentMenu;

  // keep layout stable while loading or missing role
  if (loadingRole) {
    return (
      <aside
        className={`${collapsed ? "w-20" : "w-64"} fixed top-16 left-0 h-[calc(100vh-64px)] z-40 bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white shadow-lg transition-all duration-300`}
      >
        <div className="px-3 py-4 border-b border-gray-700">
          <div className="h-6 w-24 bg-gray-700/60 rounded animate-pulse" />
        </div>
      </aside>
    );
  }

  if (!role) {
    return (
      <aside
        className={`${collapsed ? "w-20" : "w-64"} fixed top-16 left-0 h-[calc(100vh-64px)] z-40 bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white shadow-lg transition-all duration-300`}
      >
        <div className="px-3 py-4 border-b border-gray-700">
          <span className="text-sm text-gray-300">No role</span>
        </div>
      </aside>
    );
  }

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
                className={`flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${collapsed ? "justify-center" : "pl-4"}`}
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
