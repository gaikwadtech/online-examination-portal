"use client";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-amber-50 py-16 px-6">
  <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg border border-amber-200">
    <h1 className="text-3xl font-bold mb-6 text-amber-900">Terms of Service</h1>

        <p className="text-amber-700 mb-4">
          By using TestEdge, you agree to the following terms and conditions. Please
          read them carefully.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Account Responsibilities</h2>
        <p className="text-gray-700 mb-4">
          You are responsible for maintaining the confidentiality of your account and
          for all activities that occur under your account.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Use of Platform</h2>
        <p className="text-gray-700 mb-4">
          You agree to use TestEdge only for lawful purposes and not to engage in any
          activity that could harm the platform or other users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Changes to Terms</h2>
        <p className="text-gray-700 mb-4">
          TestEdge may update these terms from time to time. Continued use of the platform
          constitutes acceptance of the updated terms.
        </p>

        <p className="text-gray-700">
          For inquiries, please <a href="/contact-us" className="text-blue-500 hover:underline">contact us</a>.
        </p>
      </div>
    </div>
  );
}
