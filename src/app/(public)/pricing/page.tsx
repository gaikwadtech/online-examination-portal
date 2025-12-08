'use client';

import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 px-6">

      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-blue-700 text-center mb-4"
      >
        Simple & Transparent Pricing
      </motion.h1>

      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
        Choose the perfect plan for your institution or business. No hidden fees.
      </p>

      {/* PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

        {/* BASIC PLAN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold text-blue-600">Basic</h2>
          <p className="text-gray-500 mt-2">For small institutions</p>
          <h3 className="text-4xl font-extrabold mt-4 text-black">₹499<span className="text-lg font-medium">/month</span></h3>

          <ul className="mt-6 space-y-3 text-gray-700">
            <li>✔ 100 Students</li>
            <li>✔ 20 Tests / Month</li>
            <li>✔ Email Support</li>
          </ul>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Choose Plan
          </motion.button>
        </motion.div>

        {/* STANDARD PLAN (MOST POPULAR) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg border border-blue-200 hover:shadow-2xl scale-105"
        >
          <h2 className="text-2xl font-bold">Pro (Most Popular)</h2>
          <p className="mt-2 opacity-90">For colleges & coaching centers</p>
          <h3 className="text-4xl font-extrabold mt-4">₹1499<span className="text-lg font-medium">/month</span></h3>

          <ul className="mt-6 space-y-3 opacity-95">
            <li>✔ Unlimited Students</li>
            <li>✔ Unlimited Tests</li>
            <li>✔ AI Proctoring</li>
            <li>✔ Priority Support</li>
          </ul>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-white text-blue-700 py-2 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Choose Plan
          </motion.button>
        </motion.div>

        {/* ENTERPRISE PLAN */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl"
        >
          <h2 className="text-2xl font-bold text-purple-600">Enterprise</h2>
          <p className="text-gray-500 mt-2">For large universities & companies</p>
          <h3 className="text-4xl font-extrabold mt-4 text-black">Custom</h3>

          <ul className="mt-6 space-y-3 text-gray-700">
            <li>✔ Custom Student Limit</li>
            <li>✔ Custom Features</li>
            <li>✔ Dedicated Support</li>
          </ul>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-2 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Contact Sales
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
