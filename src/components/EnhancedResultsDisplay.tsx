import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { CheckCircle, TrendingUp, Clock, BarChart3, Target, Brain, Database, RotateCcw, Settings } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EnhancedResultsDisplayProps {
  result: AnalysisResult;
  onRetry?: () => void;
}

export const EnhancedResultsDisplay: React.FC<EnhancedResultsDisplayProps> = ({ result, onRetry }) => {
  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(2)} ${unit}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  // Generate comparison data for visualization
  const comparisonData = [
    { name: 'Your Beam', value: result.shearStrength, color: '#3B82F6' },
    { name: 'Typical Range', value: 91.88, color: '#10B981' }, // Mean from your dataset
    { name: 'High Strength', value: 200, color: '#F59E0B' },
  ];

  // Feature importance data (from your model analysis)
  const featureImportance = [
    { name: 'Beam Height', value: 23.6, color: '#3B82F6' },
    { name: 'Beam Depth', value: 16.5, color: '#10B981' },
    { name: 'Beam Width', value: 14.6, color: '#8B5CF6' },
    { name: 'Shear Span', value: 11.7, color: '#F59E0B' },
    { name: 'Reinforcement', value: 12.5, color: '#EF4444' },
    { name: 'Others', value: 21.1, color: '#6B7280' },
  ];

  // Performance metrics
  const performanceData = [
    { metric: 'Model Accuracy', value: 79.4, unit: '%', color: '#10B981' },
    { metric: 'Training Samples', value: 978, unit: '', color: '#3B82F6' },
    { metric: 'Feature Count', value: 11, unit: '', color: '#8B5CF6' },
    { metric: 'Trees in Model', value: 100, unit: '', color: '#F59E0B' },
  ];

  // Strength range analysis
  const strengthAnalysis = [
    { range: 'Low (0-50 kN)', count: 245, percentage: 25 },
    { range: 'Medium (50-100 kN)', count: 391, percentage: 40 },
    { range: 'High (100-200 kN)', count: 293, percentage: 30 },
    { range: 'Very High (200+ kN)', count: 49, percentage: 5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Main Results Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              AI Analysis Results
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shear Strength
                </h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatValue(result.shearStrength, 'kN')}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Predicted shear strength based on beam parameters
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Model Confidence
                </h3>
              </div>
              <div className={`text-3xl font-bold mb-2 ${getConfidenceColor(result.confidence)}`}>
                {(result.confidence * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getConfidenceLabel(result.confidence)} confidence level
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Model Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${item.color === '#10B981' ? 'text-green-600' : item.color === '#3B82F6' ? 'text-blue-600' : item.color === '#8B5CF6' ? 'text-purple-600' : 'text-yellow-600'}`}>
                    {item.value}{item.unit}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Analysis completed on {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shear Strength Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Shear Strength Comparison
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value} kN`, 'Shear Strength']} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Feature Importance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={featureImportance}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Importance']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strength Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          Training Data Strength Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={strengthAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            <Bar dataKey="percentage" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Input Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Input Parameters Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Beam Height:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.h_mm} mm
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Beam Depth:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.d_mm} mm
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Beam Width:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.b_mm} mm
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Concrete Strength:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.fck_Mpa} MPa
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Steel Strength:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.fyk_Mpa} MPa
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Reinforcement Ratio:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {result.inputData.rho}
            </span>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Brain className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Model Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              This prediction is based on a Random Forest model trained on 978 beam samples with 79.4% accuracy.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Model Type: Random Forest Regressor (100 trees)</p>
              <p>• Training Data: 978 reinforced concrete beam samples</p>
              <p>• Features: 11 beam geometry and material parameters</p>
              <p>• Validation: Cross-validated with out-of-bag scoring</p>
              <p>• Range: Predictions from 1.9 kN to 1295 kN</p>
            </div>
            {onRetry && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <button
                  onClick={onRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Check Again with Different Parameters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
