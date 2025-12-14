"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaLinkedin, FaFacebook } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-0">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        
       {/* Brand Section */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* LOGO */}
  <motion.img
    src="/logo111.png"
    alt="TestEdge Logo"
    className="h-14 w-auto mb-4 drop-shadow-lg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  />

  {/* BRAND NAME */}
  <h2 className="text-2xl font-bold">TestEdge</h2>

  <p className="text-gray-400 mt-3">
    Smart Online Examination Platform for Students & Teachers.
  </p>

  {/* Social Media */}
  <div className="flex space-x-4 mt-4">
    <Link href="https://www.linkedin.com/in/pratik-gaikwad-49aa43286/" target="_blank" className="text-gray-400 hover:text-blue-500">
      <FaLinkedin size={20} />
    </Link>
    <Link href="https://www.facebook.com" target="_blank" className="text-gray-400 hover:text-blue-500">
      <FaFacebook size={20} />
    </Link>
  </div>
</motion.div>


        {/* Support Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
         <h3 className="text-xl font-semibold mb-4">Support</h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <Link href="/policies/cancellation-refund" className="hover:text-blue-400">
                Cancellation & Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy-policy" className="hover:text-blue-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/term-of-service" className="hover:text-blue-400">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-blue-400">
                Contact
              </Link>
            </li>
          </ul>
        </motion.div>

        
        {/* For Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-4">For Students</h3>
          <ul className="space-y-3 text-gray-300">
            <li><Link href="/register" className="hover:text-blue-400">Get Started</Link></li>
            <li><Link href="/student-dashboard" className="hover:text-blue-400">Student Dashboard</Link></li>
          </ul>
        </motion.div>

        {/* For Educators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">For Educators</h3>
          <ul className="space-y-3 text-gray-300">
            <li><Link href="/admin-dashboard" className="hover:text-blue-400">Admin Dashboard</Link></li>
            <li><Link href="/college-admin" className="hover:text-blue-400">College Admin</Link></li>
            <li><Link href="/college-staff" className="hover:text-blue-400">College Staff</Link></li>
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
          <p className="text-gray-300">📞 +91 9049609495</p>
          <p className="text-gray-300">✉ support@testedge.com</p>
          <p className="text-gray-300">📍 Wakad, Pune, Maharashtra</p>
        </motion.div>

      </div>

      {/* Copyright */}
      <div className="text-center pt-6 mt-6 border-t border-gray-700 text-gray-400">
        © {new Date().getFullYear()} TestEdge — All Rights Reserved.
      </div>
    </footer>
  );
}
