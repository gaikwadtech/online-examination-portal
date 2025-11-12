import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Main Hero Section */}
      <section className="flex w-full flex-col items-center justify-center bg-white px-4 py-20 text-center md:py-32">
        <h1 className="text-5xl font-extrabold text-gray-900 md:text-7xl">
          Welcome to our
          <br />
          <span className="text-blue-600">Online Examination Portal</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
          Prepare, Practice, and Perform your best in online exams!
        </p>
        <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-gray-200 px-6 py-3 text-lg font-medium text-gray-800 shadow-lg hover:bg-gray-300"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Optional Pricing/Details Section */}
      <section className="w-full bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900">Features</h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to succeed.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="rounded-lg bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900">Mock Tests</h3>
              <p className="mt-4 text-gray-600">Simulate real exam conditions with our timed mock tests.</p>
            </div>
            {/* Feature Card 2 */}
            <div className="rounded-lg bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900">Role-Based Access</h3>
              <p className="mt-4 text-gray-600">Dedicated dashboards for both students and teachers.</p>
            </div>
            {/* Feature Card 3 */}
            <div className="rounded-lg bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900">Instant Results</h3>
              <p className="mt-4 text-gray-600">Get your score and detailed feedback instantly after completion.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
