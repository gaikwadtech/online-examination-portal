'use client';

export default function StudentManagementPage() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-black">Student Management</h1>
      <p className="text-gray-700">Manage students here. Add, edit, or remove students.</p>

      {/* Example table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-gray-100 rounded-lg">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="py-2 px-4 text-black">John Doe</td>
              <td className="py-2 px-4 text-black">john@example.com</td>
              <td className="py-2 px-4">
                <button className="px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 transition">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
