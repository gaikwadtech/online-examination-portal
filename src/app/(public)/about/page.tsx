"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* ================= HEADER SECTION ================= */}
      <section
        className="w-full h-[380px] flex flex-col justify-center items-center text-center text-white relative overflow-hidden"
        style={{
          backgroundImage: "url('/photo.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative text-5xl font-extrabold drop-shadow-lg -mt-12"
        >
          About TestEdge
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="relative mt-4 text-xl max-w-2xl"
        >
          "Your edge in online tests and placement readiness.  
          The smarter way to test, learn, and succeed."
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative text-lg opacity-90 mt-2"
        >
          A platform that shows you exactly where you stand.
        </motion.p>
      </section>

      {/* ================= 1. OUR MISSION ================= */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6">

          {/* TEXT LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900">Our Mission</h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              Our mission is to streamline the entire assessment lifecycle. We aim to replace outdated,
        time - consuming examination methods with a smart, automated, and scalable platform. We 
        empower educational institutions, corporate trainers, and certification bodies to focus 
        on what truly matters - learning and development - by handling the complexities of test 
        creation, proctoring, and evaluation.
            </p>
          </motion.div>

          {/* IMAGE RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Image
              src="/image.png"
              alt="Mission Image"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= 2. OUR VISION ================= */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6">

          {/* IMAGE LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Image
              src="/vision.jpg"
              alt="Vision Image"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl"
            />
          </motion.div>

          {/* TEXT RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900">Our Vision</h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              Our vision is to redefine the future of assessments by creating a smart, secure, and fully 
        digital examination ecosystem. We aim to empower students, educators, and institutions with 
        a platform that delivers transparent evaluations, instant insights, and seamless accessibility
        from anywhere.By combining technology with innovation, we aspire to make examinations not just 
        a process - but a meaningful experience that helps every learner discover their true potential 
        and prepare confidently for real - world opportunities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= 3. WHY TESTEDGE ================= */}
      <section className="w-full bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6">

          {/* TEXT LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900">
              Why TestEdge?
            </h2>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              TestEdge is designed to solve the biggest challenges in modern assessments - accuracy, 
        transparency, speed, and reliability. With advanced automation, smart evaluation tools, 
        and user - friendly interfaces, TestEdge ensures that both students and institutions get a 
        seamless testing experience. Our platform eliminates manual errors, reduces administrative
        workload, and provides real - time performance analytics that help learners understand their 
        strengths, weaknesses, and progress.
            </p>
          </motion.div>

          {/* IMAGE RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Image
              src="/choose1.jpg"
              alt="Why Choose Us"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
