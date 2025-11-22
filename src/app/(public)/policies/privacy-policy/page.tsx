"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-green-50 py-16 px-6">
  <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg border border-green-200">
    <h1 className="text-3xl font-bold mb-6 text-green-900">Privacy Policy</h1>
        <p className="text-green-700 mb-4">
          TestEdge is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, and safeguard your information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We may collect personal information such as name, email address, contact details,
          and usage data to improve our services and provide personalized experiences.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Use of Information</h2>
        <p className="text-gray-700 mb-4">
          Your data is used to provide our services, communicate with you, and improve
          our platform. We do not sell or share your personal data with third parties
          without consent.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Security</h2>
        <p className="text-gray-700 mb-4">
          We implement industry-standard security measures to protect your data.
        </p>

        <p className="text-gray-700">
          For questions, please <a href="/contact-us" className="text-blue-500 hover:underline">contact us</a>.
        </p>
      </div>
    </div>
  );
}
