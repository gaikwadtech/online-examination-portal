export default function StudentDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black">Student Dashboard</h1>
      <p className="text-gray-600 mt-2">
        Welcome! Check your exams, results, and performance analysis.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Upcoming Exam</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">2</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Results Published</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">14</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-black">Performance Rank</h2>
          <p className="mt-2 text-3xl font-bold text-purple-600">#7</p>
        </div>

      </div>
    </div>
  );
}
