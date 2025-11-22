export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black">Teacher Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome! Manage students, exams, analysis, and settings.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Total Students</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">120</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Upcoming Exams</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">05</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Pending Analysis</h2>
          <p className="mt-2 text-3xl font-bold text-purple-600">12</p>
        </div>

      </div>
    </div>
  );
}
