'use client';

export default function ExamManagementPage() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-black">Exam Management</h1>
      <p className="text-gray-700">Create, edit, or delete exams here.</p>

      {/* Example exams list */}
      <ul className="mt-6 space-y-3">
        <li className="p-3 bg-gray-100 rounded flex justify-between items-center text-black">
          <span>Math Exam - 2025</span>
          <div className="space-x-2">
            <button className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-400 transition">Edit</button>
            <button className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400 transition">Delete</button>
          </div>
        </li>
        <li className="p-3 bg-gray-100 rounded flex justify-between items-center text-black">
          <span>Science Exam - 2025</span>
          <div className="space-x-2">
            <button className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-400 transition">Edit</button>
            <button className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-400 transition">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  );
}
