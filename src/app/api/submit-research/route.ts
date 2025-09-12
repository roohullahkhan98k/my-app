import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'researcherName', 'researcherEmail', 'institution',
      'h_mm', 'd_mm', 'b_mm', 'a_mm', 'abyd', 'fck_Mpa',
      'rho', 'fyk_Mpa', 'da_mm', 'Plate_Top_mm', 'Plate_Bottom_mm', 'V_Kn'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create submission object
    const submission: ResearchSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      researcherName: body.researcherName,
      researcherEmail: body.researcherEmail,
      institution: body.institution,
      notes: body.notes || '',
      beamData: {
        h_mm: Number(body.h_mm),
        d_mm: Number(body.d_mm),
        b_mm: Number(body.b_mm),
        a_mm: Number(body.a_mm),
        abyd: Number(body.abyd),
        fck_Mpa: Number(body.fck_Mpa),
        rho: Number(body.rho),
        fyk_Mpa: Number(body.fyk_Mpa),
        da_mm: Number(body.da_mm),
        Plate_Top_mm: Number(body.Plate_Top_mm),
        Plate_Bottom_mm: Number(body.Plate_Bottom_mm),
        V_Kn: Number(body.V_Kn),
      }
    };

    // Save to JSON file (no database needed)
    const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(submissionsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing submissions
    let submissions: ResearchSubmission[] = [];
    if (fs.existsSync(submissionsPath)) {
      const fileContent = fs.readFileSync(submissionsPath, 'utf-8');
      submissions = JSON.parse(fileContent);
    }

    // Add new submission
    submissions.push(submission);

    // Save back to file
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

    // Send notification to admin (in real app, this would be email/webhook)
    console.log(`New research submission from ${submission.researcherName} at ${submission.institution}`);
    console.log(`Submission ID: ${submission.id}`);
    console.log(`Beam Data: ${JSON.stringify(submission.beamData)}`);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Research data submitted successfully for admin review'
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit research data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
