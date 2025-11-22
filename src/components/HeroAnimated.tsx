"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroAnimated() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-20">

      {/* BRAND LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Image
          src="/logo111.png"   // <-- your file name
          alt="TestEdge Logo"
          width={250}
          height={80}
          className="object-contain"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-extrabold text-gray-900 md:text-7xl"
      >
        Welcome to our <br />
        <span className="text-blue-600">Online Examination Portal</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 max-w-2xl text-lg text-gray-600 md:text-xl"
      >
        Prepare, Practice, and Perform your best in online exams!
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
      >
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
      </motion.div>
    </div>
  );
}
