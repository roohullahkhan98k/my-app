import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, action } = body;

    if (!submissionId || !action) {
      return NextResponse.json(
        { error: 'Missing submissionId or action' },
        { status: 400 }
      );
    }

    const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');
    
    if (!fs.existsSync(submissionsPath)) {
      return NextResponse.json(
        { error: 'No submissions found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(submissionsPath, 'utf-8');
    const submissions = JSON.parse(fileContent);

    const submissionIndex = submissions.findIndex((s: { id: string }) => s.id === submissionId);
    
    if (submissionIndex === -1) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission status
    submissions[submissionIndex].status = action === 'approve' ? 'approved' : 'rejected';
    submissions[submissionIndex].reviewedAt = new Date().toISOString();

    // Save updated submissions
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

    // If approved, add to training data and retrain model with validation
    if (action === 'approve') {
      const approvedSubmission = submissions[submissionIndex];
      
      // Add to training data
      const trainingDataPath = path.join(process.cwd(), 'data', 'additional_training_data.json');
      let additionalData = [];
      
      if (fs.existsSync(trainingDataPath)) {
        const additionalContent = fs.readFileSync(trainingDataPath, 'utf-8');
        additionalData = JSON.parse(additionalContent);
      }

      // Add new training sample
      const newTrainingSample = {
        ...approvedSubmission.beamData,
        Beam_Number: additionalData.length + 1000, // Start from 1000 to avoid conflicts
        timestamp: approvedSubmission.timestamp
      };

      additionalData.push(newTrainingSample);
      fs.writeFileSync(trainingDataPath, JSON.stringify(additionalData, null, 2));

      console.log(`Added new training sample: ${JSON.stringify(newTrainingSample)}`);
      console.log(`Total additional training samples: ${additionalData.length}`);
      
      // Retrain model with validation (this will be handled by the admin dashboard)
      console.log(`Model retraining will be triggered from admin dashboard`);
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
