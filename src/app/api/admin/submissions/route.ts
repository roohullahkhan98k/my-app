import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');
    
    if (!fs.existsSync(submissionsPath)) {
      return NextResponse.json({ submissions: [] });
    }

    const fileContent = fs.readFileSync(submissionsPath, 'utf-8');
    const submissions = JSON.parse(fileContent);

    return NextResponse.json({ submissions });

  } catch (error) {
    console.error('Error loading submissions:', error);
    return NextResponse.json(
      { error: 'Failed to load submissions' },
      { status: 500 }
    );
  }
}
