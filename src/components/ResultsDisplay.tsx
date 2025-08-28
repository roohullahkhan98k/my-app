import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { CheckCircle, TrendingUp, Clock, FileText } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(num);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Main Result */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Predicted Shear Strength
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(result.shearStrength)} kN
          </div>
        </div>

        {/* Confidence Level */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Model Confidence
            </span>
            <span className={`text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
              {getConfidenceText(result.confidence)}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round(result.confidence * 100)}% confidence level
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Analysis completed: {formatDate(result.timestamp)}</span>
        </div>

        {/* Input Summary */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Input Parameters Summary
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Height:</span>
              <span className="ml-1 font-medium">{result.inputData.h_mm} mm</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Depth:</span>
              <span className="ml-1 font-medium">{result.inputData.d_mm} mm</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Width:</span>
              <span className="ml-1 font-medium">{result.inputData.b_mm} mm</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Concrete Strength:</span>
              <span className="ml-1 font-medium">{result.inputData.fck_Mpa} MPa</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
