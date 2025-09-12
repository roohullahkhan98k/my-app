import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const versionsPath = path.join(process.cwd(), 'data', 'model_versions.json');
    
    if (!fs.existsSync(versionsPath)) {
      return NextResponse.json({
        success: false,
        message: 'Model versions file not found'
      }, { status: 404 });
    }

    const versionsData = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
    
    return NextResponse.json({
      success: true,
      current_version: versionsData.current_version,
      versions: Object.values(versionsData.versions)
    });

  } catch (error) {
    console.error('Error loading model versions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load model versions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
