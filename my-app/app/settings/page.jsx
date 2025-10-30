"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setMessage("Settings saved successfully!");
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              Market<span className="text-blue-600">IQ</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Dashboard</Link>
              <Link href="/trade" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Trade</Link>
              <Link href="/profile" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Profile</Link>
              <Link href="/contact" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">Contact</Link>
              <Link href="/settings" className="px-4 py-2 rounded-md text-gray-600 bg-gray-100">Settings</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
              className="mr-2"
            />
            <span>Enable email notifications</span>
          </div>
          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
          {message && <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">{message}</div>}
        </form>
      </div>
    </div>
  );
}
