import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { X, FileText, Upload, CheckCircle } from 'lucide-react';
import { beamAnalysisSchema, BeamAnalysisFormData } from '@/lib/types';
import { z } from 'zod';

interface ResearchSubmissionFormProps {
  onClose: () => void;
}

interface SubmissionData extends BeamAnalysisFormData {
  researcherName: string;
  researcherEmail: string;
  institution: string;
  notes: string;
}

const submissionSchema = beamAnalysisSchema.extend({
  researcherName: z.string().min(2, "Name must be at least 2 characters"),
  researcherEmail: z.string().email("Invalid email address"),
  institution: z.string().min(2, "Institution name required"),
  notes: z.string().optional(),
});

export const ResearchSubmissionForm: React.FC<ResearchSubmissionFormProps> = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SubmissionData>({
    resolver: zodResolver(submissionSchema),
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

  const onSubmit = async (data: SubmissionData) => {
    setIsSubmitting(true);
    
    try {
      // Submit to API endpoint
      const response = await fetch('/api/submit-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Research data submitted successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit research data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSections = [
    {
      title: "Researcher Information",
      icon: FileText,
      fields: [
        { name: 'researcherName' as keyof SubmissionData, label: 'Your Name', type: 'text' },
        { name: 'researcherEmail' as keyof SubmissionData, label: 'Email Address', type: 'email' },
        { name: 'institution' as keyof SubmissionData, label: 'Institution/Organization', type: 'text' },
      ]
    },
    {
      title: "Beam Geometry",
      icon: FileText,
      fields: [
        { name: 'h_mm' as keyof SubmissionData, label: 'Beam Height (mm)', type: 'number' },
        { name: 'd_mm' as keyof SubmissionData, label: 'Beam Depth (mm)', type: 'number' },
        { name: 'b_mm' as keyof SubmissionData, label: 'Beam Width (mm)', type: 'number' },
        { name: 'a_mm' as keyof SubmissionData, label: 'Shear Span (mm)', type: 'number' },
        { name: 'abyd' as keyof SubmissionData, label: 'Shear Span/Depth Ratio', type: 'number', step: "0.1" },
      ]
    },
    {
      title: "Material Properties",
      icon: FileText,
      fields: [
        { name: 'fck_Mpa' as keyof SubmissionData, label: 'Concrete Strength (MPa)', type: 'number' },
        { name: 'rho' as keyof SubmissionData, label: 'Reinforcement Ratio', type: 'number', step: "0.001" },
        { name: 'fyk_Mpa' as keyof SubmissionData, label: 'Steel Yield Strength (MPa)', type: 'number' },
        { name: 'da_mm' as keyof SubmissionData, label: 'Concrete Cover (mm)', type: 'number' },
      ]
    },
    {
      title: "Plate Configuration",
      icon: FileText,
      fields: [
        { name: 'Plate_Top_mm' as keyof SubmissionData, label: 'Top Plate Thickness (mm)', type: 'number' },
        { name: 'Plate_Bottom_mm' as keyof SubmissionData, label: 'Bottom Plate Thickness (mm)', type: 'number' },
      ]
    },
    {
      title: "Test Results",
      icon: FileText,
      fields: [
        { name: 'V_Kn' as keyof SubmissionData, label: 'Actual Shear Strength (kN)', type: 'number' },
      ]
    }
  ];

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Submission Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your research data has been submitted for review. The admin will review and approve it to improve the model.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This window will close automatically...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                Submit Research Data
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {formSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                <section.icon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      step={field.step}
                      {...register(field.name)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[field.name]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Additional Notes
              </h3>
            </div>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Any additional information about your research, test conditions, or methodology..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Submit Research Data
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
