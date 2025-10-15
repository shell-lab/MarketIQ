import React from 'react';

export default function LoginForm() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
      >
        Log in
      </button>
    </form>
  );
}
