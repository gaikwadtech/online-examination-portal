"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ContactUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How can I maximize my exam score?",
      a: "Review your past exam performance in the dashboard, focus on weak areas, and take advantage of our practice tests."
    },
    {
      q: "Is there technical support during exams?",
      a: "Yes! Our support team is available 24/7. Use the chat widget or call our hotline if you face issues."
    },
    {
      q: "Can I retake an exam?",
      a: "This depends on the specific rules set by your institution for each exam. Check the exam details page."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">

        {/* Heading Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100">
            <MessageCircle size={16} /> Get in Touch
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            We'd love to hear from you
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Whether you have a question about our features, pricing, or just want to say hi, our team is ready to answer all your questions.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>

            {status.message && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {status.message}
              </div>
            )}

            {/* Form State update happens in the full file context, but for this chunk we replace the inputs */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Send Message <Send size={20} /></>}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Info Card */}
            <div className="bg-indigo-900 text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden group">
               {/* Decorative Circles */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl" />

              <h3 className="text-xl font-bold mb-8 relative z-10">Contact Information</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Phone className="text-indigo-200" size={24} />
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Call Us</p>
                    <p className="text-lg font-semibold">+91 9049609495</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Mail className="text-indigo-200" size={24} />
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Email Us</p>
                    <p className="text-lg font-semibold">support@testedge.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <MapPin className="text-indigo-200" size={24} />
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Visit Us</p>
                    <p className="text-lg font-semibold leading-snug">Wakad, Pune, Maharashtra<br/>India – 411057</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 h-[280px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199154.25902064535!2d73.46819228671875!3d18.60062060000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9dc4ce5ac9f%3A0x7fdeb0087efc3a7f!2sPhoenix%20Mall%20of%20the%20Millennium!5e1!3m2!1sen!2sin!4v1763142095192!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1rem' }}
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => toggleFaq(index)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                  {openFaq === index ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-gray-400" />}
                </div>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="px-6 pb-6 text-gray-600"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

