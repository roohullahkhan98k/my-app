'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Hash, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const [adminNumber, setAdminNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Encrypted admin number (this is the secure number you'll use)
  // Generated using: btoa('BEAM_ADMIN_2024_SECURE') + timestamp hash
  const ADMIN_ENCRYPTED_NUMBER = 'QkVBTUFETUlOXzIwMjRfU0VDVVJFXzE3MzY3MTI4MDAw';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (adminNumber === ADMIN_ENCRYPTED_NUMBER) {
      // Store admin session
      localStorage.setItem('admin_authenticated', 'true');
      toast.success('Access granted!');
      router.push('/admin/dashboard');
    } else {
      toast.error('Invalid access number');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your encrypted access number
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Encrypted Access Number
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={adminNumber}
                onChange={(e) => setAdminNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Enter encrypted access number"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
            <strong>🔐 Secure Access:</strong><br />
            Enter your encrypted admin number to access the system
          </p>
        </div>
      </motion.div>
      <Toaster position="top-center" />
    </div>
  );
}
