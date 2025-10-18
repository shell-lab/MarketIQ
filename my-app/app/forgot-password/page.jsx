"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage('If an account with that email exists, a reset link has been sent.');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-8 rounded-lg border-t-4 border-blue-500">
        <h1 className="text-xl font-bold my-4">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="border border-gray-200 px-4 py-2 rounded-md"
            required
          />
          <button className="bg-blue-600 text-white font-bold cursor-pointer px-6 py-2 rounded-md">
            Send Reset Link
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {message}
            </div>
          )}
        </form>
        <div className="text-sm mt-4 text-right">
          <Link href="/login" className="underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}