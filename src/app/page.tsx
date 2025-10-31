import React from 'react';

async function getDbStatus() {
  try {
    // Fetch from port 5050 as required
    const res = await fetch('http://localhost:5050/api/test-db', {
      cache: 'no-store', // Ensures we get fresh data every time
    });

    if (!res.ok) {
      throw new Error('Failed to fetch');
    }
    return res.json();
  } catch (error: any) {
    return { message: `Error from client: ${error.message}` };
  }
}

export default async function Home() {
  const data = await getDbStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Database Connection Test</h1>
        <p className={
          data.message.startsWith('Success') 
            ? "text-green-500" 
            : "text-red-500"
        }>
          {data.message}
        </p>
      </div>
    </main>
  );
}