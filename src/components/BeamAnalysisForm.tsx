import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FormInput } from './FormInput';
import { LoadingSpinner } from './LoadingSpinner';
import { ResultsDisplay } from './ResultsDisplay';
import { beamAnalysisSchema, BeamAnalysisFormData, AnalysisResult } from '@/lib/types';
import { Calculator, Ruler, Zap, Settings } from 'lucide-react';

export const BeamAnalysisForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
    
    // Simulate API call with dummy result
    setTimeout(() => {
      const dummyResult: AnalysisResult = {
        shearStrength: Math.random() * 200 + 100, // Random value between 100-300 kN
        confidence: Math.random() * 0.4 + 0.6, // Random confidence between 0.6-1.0
        timestamp: new Date().toISOString(),
        inputData: data
      };
      
      setResult(dummyResult);
      setIsLoading(false);
      toast.success('Analysis completed successfully!');
    }, 2000);
  };

  const handleReset = () => {
    reset();
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Beam Shear Strength Analysis
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Advanced machine learning-based analysis for predicting shear strength of reinforced concrete beams with steel plates.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      Analyze Beam
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12">
              <LoadingSpinner size="lg" text="Processing beam analysis..." />
            </div>
          )}
          
          {result && !isLoading && (
            <ResultsDisplay result={result} />
          )}
          
          {!result && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready for Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the beam parameters and click &quot;Analyze Beam&quot; to get started.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
