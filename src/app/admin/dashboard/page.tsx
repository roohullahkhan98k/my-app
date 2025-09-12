'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Database, Brain, TrendingUp, Users, FileText, Settings, RotateCcw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ResearchSubmission {
  id: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  researcherName: string;
  researcherEmail: string;
  institution: string;
  notes?: string;
  beamData: {
    h_mm: number;
    d_mm: number;
    b_mm: number;
    a_mm: number;
    abyd: number;
    fck_Mpa: number;
    rho: number;
    fyk_Mpa: number;
    da_mm: number;
    Plate_Top_mm: number;
    Plate_Bottom_mm: number;
    V_Kn: number;
  };
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ResearchSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [modelVersions, setModelVersions] = useState<any[]>([]);
  const [currentModelInfo, setCurrentModelInfo] = useState<any>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      window.location.href = '/admin/login';
      return;
    }

    loadSubmissions();
    loadModelVersions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelVersions = async () => {
    try {
      const response = await fetch('/api/admin/model-versions');
      if (response.ok) {
        const data = await response.json();
        setModelVersions(data.versions || []);
        setCurrentModelInfo(data.versions?.find((v: any) => v.status === 'active') || data.versions?.[0]);
      }
    } catch (error) {
      console.error('Failed to load model versions:', error);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      setIsRetraining(true);
      toast.success('Starting approval process...');
      
      // First approve the submission
      const approveResponse = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action: 'approve' })
      });

      if (!approveResponse.ok) {
        throw new Error('Failed to approve submission');
      }

      toast.success('Submission approved! Starting model retraining...');
      
      // Then retrain model with validation
      const retrainResponse = await fetch('/api/admin/retrain-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!retrainResponse.ok) {
        throw new Error('Model retraining failed');
      }

      const result = await retrainResponse.json();
      
      if (result.success) {
        toast.success('Model retrained successfully with improved performance!');
        loadModelVersions(); // Refresh model versions
      } else {
        toast.error('Model retraining completed but performance was not improved. Keeping current model.');
      }
      
      loadSubmissions();
      
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // If retraining failed, we should reject the submission
      try {
        await fetch('/api/admin/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, action: 'reject' })
        });
        toast.error('Submission rejected due to retraining failure');
        loadSubmissions();
      } catch (rejectError) {
        console.error('Failed to reject submission:', rejectError);
      }
    } finally {
      setIsRetraining(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action: 'reject' })
      });

      if (response.ok) {
        toast.success('Submission rejected');
        loadSubmissions();
      } else {
        toast.error('Failed to reject submission');
      }
    } catch (error) {
      toast.error('Failed to reject submission');
    }
  };

  const handleRollback = async () => {
    try {
      setIsRollingBack(true);
      toast.success('Starting model rollback to original version...');
      
      const response = await fetch('/api/admin/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Model rolled back to original version successfully!');
          loadModelVersions();
        } else {
          toast.error('Model rollback failed');
        }
      } else {
        toast.error('Model rollback failed');
      }
    } catch (error) {
      toast.error('Failed to rollback model');
    } finally {
      setIsRollingBack(false);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Model Status: {isRetraining ? 'Retraining...' : isRollingBack ? 'Rolling back...' : 'Active'}
              </span>
              <button
                onClick={handleRollback}
                disabled={isRetraining || isRollingBack}
                className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isRollingBack ? 'Rolling Back...' : 'Rollback to Original'}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_authenticated');
                  window.location.href = '/admin/login';
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingSubmissions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {approvedSubmissions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rejectedSubmissions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {submissions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Version Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Model Version Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Model Info</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentModelInfo?.version || 'v1.0.0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Training Samples:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentModelInfo?.training_samples || 978}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">R² Score:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentModelInfo?.r2_score?.toFixed(4) || '0.6525'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-sm font-medium text-green-600">
                    {currentModelInfo?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleRollback}
                  disabled={isRetraining || isRollingBack}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isRollingBack ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rolling Back...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Rollback to Original Model
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will restore the original model and clear all additional training data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-600" />
            Pending Submissions ({pendingSubmissions.length})
          </h2>

          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Researcher Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Researcher Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {submission.researcherName}</p>
                        <p><strong>Email:</strong> {submission.researcherEmail}</p>
                        <p><strong>Institution:</strong> {submission.institution}</p>
                        <p><strong>Submitted:</strong> {new Date(submission.timestamp).toLocaleString()}</p>
                        {submission.notes && (
                          <p><strong>Notes:</strong> {submission.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Beam Data */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Beam Test Data
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Height:</strong> {submission.beamData.h_mm} mm</p>
                        <p><strong>Depth:</strong> {submission.beamData.d_mm} mm</p>
                        <p><strong>Width:</strong> {submission.beamData.b_mm} mm</p>
                        <p><strong>Shear Span:</strong> {submission.beamData.a_mm} mm</p>
                        <p><strong>Concrete:</strong> {submission.beamData.fck_Mpa} MPa</p>
                        <p><strong>Steel:</strong> {submission.beamData.fyk_Mpa} MPa</p>
                        <p><strong>Reinforcement:</strong> {submission.beamData.rho}</p>
                        <p><strong>Shear Strength:</strong> {submission.beamData.V_Kn} kN</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={isRetraining}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isRetraining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Retraining...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Approve & Retrain Model
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      disabled={isRetraining}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isRetraining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Retraining Status */}
        {isRetraining && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Model Retraining in Progress
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  The model is being retrained with the new data. This may take a few minutes...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
