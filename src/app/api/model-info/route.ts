import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try to load model info from the model file first
    const modelPath = path.join(process.cwd(), 'scripts', 'MLBeam_model.pkl');
    
    if (fs.existsSync(modelPath)) {
      try {
        // Load model data (this might fail if joblib is not available in Node.js)
        // For now, we'll use the versions file as fallback
        const versionsPath = path.join(process.cwd(), 'data', 'model_versions.json');
        
        if (fs.existsSync(versionsPath)) {
          const versionsData = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
          const currentVersion = versionsData.versions[versionsData.current_version];
          
          if (currentVersion) {
            return NextResponse.json({
              success: true,
              version: currentVersion.version,
              training_samples: currentVersion.training_samples,
              additional_samples: currentVersion.additional_samples,
              r2_score: currentVersion.r2_score,
              oob_score: currentVersion.oob_score,
              created_at: currentVersion.created_at,
              description: currentVersion.description,
              status: currentVersion.status
            });
          }
        }
      } catch (error) {
        console.error('Error loading model info:', error);
      }
    }
    
    // Fallback to default values
    return NextResponse.json({
      success: true,
      version: 'v1.0.0',
      training_samples: 978,
      additional_samples: 0,
      r2_score: 0.6525,
      oob_score: 0.7941,
      created_at: '2025-09-12T19:47:22.821685',
      description: 'Original model trained on 978 samples',
      status: 'active'
    });

  } catch (error) {
    console.error('Error getting model info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get model info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
