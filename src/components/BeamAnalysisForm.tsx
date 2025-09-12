import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FormInput } from './FormInput';
import { LoadingSpinner } from './LoadingSpinner';
import { EnhancedResultsDisplay } from './EnhancedResultsDisplay';
import { ResearchSubmissionForm } from './ResearchSubmissionForm';
import { beamAnalysisSchema, BeamAnalysisFormData, AnalysisResult } from '@/lib/types';
import { Calculator, Ruler, Zap, Settings, Plus, FileText } from 'lucide-react';

export const BeamAnalysisForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<BeamAnalysisFormData>({
    resolver: zodResolver(beamAnalysisSchema),
    defaultValues: {
      h_mm: 300,
      d_mm: 250,
      b_mm: 150,
      a_mm: 500,
      abyd: 2.0,
      fck_Mpa: 30,
      rho: 0.02,
      fyk_Mpa: 500,
      da_mm: 25,
      Plate_Top_mm: 10,
      Plate_Bottom_mm: 10,
    }
  });

  const onSubmit = async (data: BeamAnalysisFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze beam');
      }

      if (!result.success) {
        throw new Error(result.error || 'Prediction failed');
      }

      const analysisResult: AnalysisResult = {
        shearStrength: result.shearStrength,
        confidence: result.confidence,
        timestamp: result.timestamp,
        inputData: data
      };
      
      setResult(analysisResult);
      setShowResults(true);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setShowResults(false);
  };

  const handleRetry = () => {
    setShowResults(false);
    setResult(null);
  };

  const formSections = [
    {
      title: "Beam Geometry",
      icon: Ruler,
      fields: [
        { name: 'h_mm' as keyof BeamAnalysisFormData, label: 'Beam Height' },
        { name: 'd_mm' as keyof BeamAnalysisFormData, label: 'Beam Depth' },
        { name: 'b_mm' as keyof BeamAnalysisFormData, label: 'Beam Width' },
        { name: 'a_mm' as keyof BeamAnalysisFormData, label: 'Shear Span' },
        { name: 'abyd' as keyof BeamAnalysisFormData, label: 'Shear Span/Depth Ratio', step: "0.1" },
      ]
    },
    {
      title: "Material Properties",
      icon: Settings,
      fields: [
        { name: 'fck_Mpa' as keyof BeamAnalysisFormData, label: 'Concrete Strength' },
        { name: 'rho' as keyof BeamAnalysisFormData, label: 'Reinforcement Ratio', step: "0.001" },
        { name: 'fyk_Mpa' as keyof BeamAnalysisFormData, label: 'Steel Yield Strength' },
        { name: 'da_mm' as keyof BeamAnalysisFormData, label: 'Concrete Cover' },
      ]
    },
    {
      title: "Plate Configuration",
      icon: Zap,
      fields: [
        { name: 'Plate_Top_mm' as keyof BeamAnalysisFormData, label: 'Top Plate Thickness' },
        { name: 'Plate_Bottom_mm' as keyof BeamAnalysisFormData, label: 'Bottom Plate Thickness' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Calculator className="h-10 w-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                AI Beam Analysis Platform
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Advanced machine learning-based analysis for predicting shear strength of reinforced concrete beams with steel plates. 
              Trained on 978 samples with 79.4% accuracy.
            </p>
            
            {/* Add Research Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add Your Research to Improve the Model
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showResults ? (
          /* Form Section - Show First */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Input Parameters
                </h2>
              </div>
            
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                {formSections.map((section) => (
                  <div key={section.title} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                      <section.icon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <FormInput
                          key={field.name}
                          name={field.name}
                          label={field.label}
                          register={register}
                          error={errors[field.name]}
                          step={field.step}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-lg"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" text="" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-6 w-6" />
                        Analyze Beam
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          /* Results Section - Show After Analysis */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Retry Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRetry}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Calculator className="h-5 w-5" />
                Analyze Another Beam
              </button>
            </div>

            {/* Results Display */}
            {result && <EnhancedResultsDisplay result={result} onRetry={handleRetry} />}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
              <LoadingSpinner size="lg" text="Processing beam analysis..." />
            </div>
          </motion.div>
        )}

        {/* Research Submission Form Modal */}
        {showSubmissionForm && (
          <ResearchSubmissionForm onClose={() => setShowSubmissionForm(false)} />
        )}
      </div>
    </div>
  );
};