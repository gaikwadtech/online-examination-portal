'use client';

import { useEffect, useState } from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();

      if (res.ok) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-black">Student Management</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-gray-100 rounded-lg">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Registered On</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-600">
                  Loading students…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-600">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student._id}
                  className="border-b border-gray-300"
                >
                  <td className="py-2 px-4 text-black">{student.name}</td>
                  <td className="py-2 px-4 text-black">{student.email}</td>
                  <td className="py-2 px-4 text-black">
                    {formatDate(student.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
