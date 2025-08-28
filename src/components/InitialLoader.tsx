import React from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

export const InitialLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Main Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center mx-auto">
            <Calculator className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        {/* Title Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Beam Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading advanced ML engine...
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="w-64 mx-auto"
        >
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2, 
                delay: 1,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="space-y-2"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Initializing structural analysis modules...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
