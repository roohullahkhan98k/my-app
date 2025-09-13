'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BeamAnalysisForm } from '@/components/BeamAnalysisForm';
import { InitialLoader } from '@/components/InitialLoader';
import { Brain, Database } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState<{
    version: string;
    training_samples: number;
    additional_samples: number;
    r2_score: number;
    oob_score: number;
    created_at: string;
    description: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    // Load model information
    const loadModelInfo = async () => {
      try {
        const response = await fetch('/api/model-info');
        if (response.ok) {
          const data = await response.json();
          setModelInfo(data);
        }
      } catch (error) {
        console.error('Failed to load model info:', error);
      }
    };

    loadModelInfo();

    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <InitialLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Model Status Header */}
      {modelInfo && (
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    AI Model Version: {modelInfo.version}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Training Samples: {modelInfo.training_samples}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  R² Score: {modelInfo.r2_score?.toFixed(4) || 'N/A'}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last Updated: {new Date(modelInfo.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BeamAnalysisForm />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
