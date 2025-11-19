"use client";

import Link from "next/link";

export default function CancellationRefund() {
  return (
    <div className="min-h-screen bg-blue-50 py-16 px-6">
  <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg border border-blue-200">
    <h1 className="text-3xl font-bold mb-6 text-blue-900">Cancellation & Refund Policy</h1>
        <p className="text-blue-700 mb-4">
          At TestEdge, we understand that plans can change. Below is our
          cancellation and refund policy:
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Cancellation</h2>
        <p className="text-gray-700 mb-4">
          Users may cancel their subscription or booked services anytime. Cancellations
          must be made at least 24 hours before the scheduled date to be eligible for a refund.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Refunds</h2>
        <p className="text-gray-700 mb-4">
          Refunds will be processed within 7-10 business days after approval. Refund
          amounts may vary depending on the services used and the timing of the cancellation.
        </p>

        <p className="text-gray-700">
          For more information, please <Link href="/contact-us" className="text-blue-500 hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
