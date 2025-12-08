"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">

      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-24 text-center md:py-36">

        {/* Background Blur Circles */}
        <div className="absolute top-10 left-10 h-48 w-48 rounded-full bg-blue-300 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-purple-300 opacity-30 blur-3xl"></div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-gray-900 md:text-7xl"
        >
          Welcome to our
          <br />
          <span className="text-blue-600">Online Examination Portal</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl mx-auto"
        >
          Prepare smarter. Practice better. Perform your best in every exam!
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center"
        >
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-white px-8 py-3 text-lg font-semibold text-gray-800 shadow-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 transform border border-gray-200"
          >
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full bg-violet-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">

          <h2 className="text-4xl font-bold text-gray-900">Why Choose Us?</h2>
          <p className="mt-4 text-lg text-blue-600">
            Strong tools, smooth experience, instant results.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">

            {/* Card 1 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-200"
            >
              <h3 className="text-2xl font-bold text-gray-900">Mock Tests</h3>
              <p className="mt-4 text-gray-600">
                Experience real exam-like environments with timed mock tests.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-200"
            >
              <h3 className="text-2xl font-bold text-gray-900">Role-Based Access</h3>
              <p className="mt-4 text-gray-600">
                Separate dashboards for students & teachers for better management.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-pink-200"
            >
              <h3 className="text-2xl font-bold text-gray-900">Instant Results</h3>
              <p className="mt-4 text-gray-600">
                Get your score, correct answers & analysis right after completion.
              </p>
            </motion.div>

          </div>
        </div>
      </section>
    <section className="section">
  <div className="container">
    <div className="left">
      <h2>Let's save trees together 🌿</h2>
      <p>
        Choose online assessments with Testportal and reduce your ecological
        footprint. Help us save trees and water for future generations.
      </p>
    </div>

    <div className="right">
      <p>Number of answers given: <span>1,390,358,211</span></p>
      <hr />
      <p>Avg. number of questions per sheet: <span>5</span></p>
      <hr />
      <p>Sheets from one tree: <span>8,000</span></p>
      <hr />
      <p className="trees-saved">Trees saved  =  </p>
      <p className="big-number">34,758</p>
    </div>
  </div>

  <div className="image-container">
    <img src="/tree.png" alt="Trees" />
  </div>
</section>

{/* TOP MNC SCROLLER SECTION */}
<section className="w-full bg-white py-16 overflow-hidden -mt-10">
  <h2 className="text-3xl font-bold text-center text-gray-900">
    All Top MNC Companies & Top Universities
  </h2>
  <p className="text-center text-gray-600 mt-2">
    Prepare for top MNCs with our comprehensive Test Series.
  </p>

  {/* SCROLLER ROW */}
  <div className="mt-10 overflow-hidden relative">
    
    {/* ANIMATION CONTAINER */}
    <div className="flex items-center space-x-20 animate-scroll">
      
      {/* Repeat your logos here */}
      <img src="/tcs logo.png" className="h-14" alt="TCS" />
      <img src="/infosys logo.png" className="h-14" alt="Infosys" />
      <img src="/Sppu_Logo.png" className="h-14" alt="SPPU" />
      <img src="/wipro logo.png" className="h-14" alt="Wipro" />
      <img src="/dyp logo.png" className="h-14" alt="DYP" />
      <img src="/hcl_logo.png" className="h-14" alt="HCL" />
      <img src="/capgemini_logo.png" className="h-14" alt="Capgemini" />
      <img src="/bvj_logo.png" className="h-14" alt="BVG" />
      <img src="/cognizant_logo.png" className="h-14" alt="Cognizant" />
      <img src="/amity_logo.png" className="h-14" alt="AMITY" />
      <img src="/SGU_Logo1.png" className="h-14" alt="SGU" />
      <img src="/Symb logo.png" className="h-14" alt="SYM" />

      {/* Duplicate for perfect infinite loop */}
      <img src="/tcs logo.png" className="h-14" alt="TCS" />
      <img src="/infosys logo.png" className="h-14" alt="Infosys" />
      <img src="/Sppu_Logo.png" className="h-14" alt="SPPU" />
      <img src="/wipro logo.png" className="h-14" alt="Wipro" />
      <img src="/dyp logo.png" className="h-14" alt="DYP" />
      <img src="/hcl_logo.png" className="h-14" alt="HCL" />
      <img src="/capgemini_logo.png" className="h-14" alt="Capgemini" />
      <img src="/bvj_logo.png" className="h-14" alt="BVG" />
      <img src="/cognizant_logo.png" className="h-14" alt="Cognizant" />
      <img src="/amity_logo.png" className="h-14" alt="AMITY" />
      <img src="/SGU_Logo1.png" className="h-14" alt="SGU" />
      <img src="/Symb logo.png" className="h-14" alt="SYM" />

    </div>
  </div>
</section>
<section className="w-full bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 py-20">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fadeIn">
      Who It's For
    </h2>
    <p className="text-lg text-gray-700 mb-12 animate-fadeIn delay-150">
      This platform is designed for students, teachers, and educational institutions 
      looking to enhance learning and management.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-200"
      >
        <h3 className="text-xl font-semibold mb-2 text-amber-800">Students</h3>
        <p className="text-amber-900">Track progress, take exams, and view results easily.</p>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-200"
      >
        <h3 className="text-xl font-semibold mb-2 text-emerald-800">Teachers</h3>
        <p className="text-emerald-900">Manage exams, students, and analyze performance efficiently.</p>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-violet-200"
      >
        <h3 className="text-xl font-semibold mb-2 text-violet-800">Institutions</h3>
        <p className="text-violet-900">Oversee and improve learning outcomes across your organization.</p>
      </motion.div>
    </div>
  </div>
</section>

{/* BENEFITS FOR SCHOOLS / INSTITUTES */}
<section className="w-full py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
  <div className="mx-auto max-w-7xl px-6">

    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl font-extrabold text-gray-900 text-center"
    >
      Benefits for Schools / Institutes
    </motion.h2>

    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-lg text-gray-600 text-center mt-3 max-w-2xl mx-auto"
    >
      Make the switch to mobile — conduct tests & track performance seamlessly on Android and iOS.
    </motion.p>

    {/* 3 Column Layout */}
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

      {/* Benefit Box */}
      {[
        {
          title: "Instant Mobile Access",
          desc: "Conduct exams & monitor progress instantly on any device.",
          icon: "Smartphone",
        },
        {
          title: "Accurate Test Results",
          desc: "Get perfect results with analytics & insights.",
          icon: "BarChart3",
        },
        {
          title: "Multi-Center Management",
          desc: "Manage multiple exam centers smoothly.",
          icon: "Building2",
        },
        {
          title: "Share Feedback Easily",
          desc: "Send comments, results & remarks instantly.",
          icon: "MessageCircle",
        },
        {
          title: "Supports Multiple Languages",
          desc: "Conduct exams in regional & foreign languages.",
          icon: "Languages",
        },
        {
          title: "Complete Automation",
          desc: "Attendance, registration & paper upload made automatic.",
          icon: "Settings",
        },
      ].map((item, index) => {
        const Icon = require("lucide-react")[item.icon];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="p-8 rounded-2xl shadow-lg bg-white border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Icon size={34} className="text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {item.title}
              </h3>
            </div>

            <p className="mt-4 text-gray-700">{item.desc}</p>
          </motion.div>
        );
      })}
    </div>
  </div>
</section>


    </div>
  );
}
