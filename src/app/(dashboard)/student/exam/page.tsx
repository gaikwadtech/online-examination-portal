'use client';

import React from 'react';

export default function ExamPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-black">Exams</h1>
      <div className="bg-white p-6 rounded shadow-md text-black">
        <p>You can list all exams here for the student to attempt.</p>
        {/* Example: Map exams from API */}
      </div>
    </div>
  );
}
