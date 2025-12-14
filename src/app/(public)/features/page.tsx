"use client";

import { motion } from "framer-motion";

export default function FeaturesPage() {
  return (
    <div className="w-full">

      {/* -------------------- HEADER BANNER -------------------- */}
      <section
        className="w-full h-[380px] flex flex-col justify-center items-center text-center text-white"
        style={{
          backgroundImage: "url('/photo.jpeg')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl text-[#FF8C00] font-extrabold drop-shadow-lg -mt-20"
        >
          TestEdge
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl font-extrabold drop-shadow-lg mt-8"
        >
          Portal Features
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-4 text-xl text-white max-w-2xl font-bold drop-shadow-lg"
        >
          "Create, manage, and evaluate exams with complete transparency.
          Reliable tools that save time and reduce manual workload."
        </motion.p>
      </section>

      {/* -------------------- FEATURES GRID -------------------- */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 bg-white">

        {[
          {
            icon: "📘",
            title: "Comprehensive Question Bank",
            desc: "A large repository of aptitude, technical, coding, and company-specific questions, helping institutions create exams instantly without manual effort.",
            bg: "bg-gray-100",
          },
          {
            icon: "🛡️",
            title: "Secure Authentication System",
            desc: "Encrypted login, OTP verification, login monitoring, and multi-role access for enhanced security.",
            bg: "bg-green-100",
          },
          {
            icon: "📊",
            title: "In-Depth Performance Analytics",
            desc: "Interactive dashboards provide topic-wise insights, time analysis, and accuracy metrics so students can track their progress effectively.",
            bg: "bg-purple-100",
          },
          {
            icon: "🏢",
            title: "Multi-College Architecture",
            desc: "Every college gets an isolated dashboard to manage students, exams, roles, and analytics within a controlled environment.",
            bg: "bg-orange-100",
          },
          {
            icon: "👥",
            title: "Role-Based Dashboards",
            desc: "Super Admins, College Admins, Staff, and Students each receive personalized dashboards to manage their responsibilities smoothly.",
            bg: "bg-blue-100",
          },
          {
            icon: "💳",
            title: "Real-Time Exam Monitoring",
            desc: "Live student count, active exams, violation alerts, and exam health status accessible to admins.",
            bg: "bg-indigo-100",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ scale: 1.05 }}
            className={`${feature.bg} p-8 rounded-3xl shadow-md cursor-pointer`}
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold mb-3 text-black">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* -------------------- CTA SECTION -------------------- */}
      <section className="w-full bg-indigo-600 text-white py-16 px-6 text-center mt-0">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Ready to Experience the Future of Online Assessments?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90"
        >
          Join thousands of students and institutions who trust
          <span className="font-semibold"> TestEdge</span> for secure exams,
          smart analytics, and seamless placement-focused preparation.
        </motion.p>

        <motion.a
          href="/register"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        >
          Get Started Today
        </motion.a>
      </section>

    </div>
  );
}
