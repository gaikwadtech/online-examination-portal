"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white py-20 px-6">

      {/* Heading Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-600 mt-3 text-lg">
          Have questions? We’re here to help you 24/7.
        </p>
      </motion.div>

      {/* Main Section (Form + Info) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-[#F0E68C] shadow-lg rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6 text-black">Send Us a Message</h2>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                className="w-full mt-1 p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full mt-1 p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your email"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                rows={4}
                className="w-full mt-1 p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>

        {/* Contact Info + Map */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Info Cards */}
          <div className="bg-[#FFB6C1] shadow-lg rounded-2xl p-8 space-y-6">

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone size={28} className="text-blue-600" />
              <div>
                <h3 className="text-md font-semibold text-black">Phone</h3>
                <p className="text-gray-600">+91 9049609495</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail size={28} className="text-blue-600" />
              <div>
                <h3 className="text-md font-semibold text-black">Email</h3>
                <p className="text-gray-600">support@testedge.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <MapPin size={28} className="text-blue-600" />
              <div>
                <h3 className="text-md font-semibold text-black">Address</h3>
                <p className="text-gray-600">
                  Wakad, Pune, Maharashtra, India – 411057
                </p>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199154.25902064535!2d73.46819228671875!3d18.60062060000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9dc4ce5ac9f%3A0x7fdeb0087efc3a7f!2sPhoenix%20Mall%20of%20the%20Millennium!5e1!3m2!1sen!2sin!4v1763142095192!5m2!1sen!2sin"
              width="100%"
              height="250"
              loading="lazy"
            ></iframe>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
}
