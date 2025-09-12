import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔄 Starting model retraining with validation...');
    
    // Path to the retraining script
    const scriptPath = path.join(process.cwd(), 'scripts', 'retrain_model_with_validation.py');
    
    return new Promise<NextResponse>((resolve) => {
      // Run the Python retraining script
      const pythonProcess = spawn('python', [scriptPath], {
        cwd: path.join(process.cwd(), 'scripts'),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Model retraining completed successfully');
          resolve(NextResponse.json({
            success: true,
            message: 'Model retrained successfully with validation',
            output: output,
            code: code
          }));
        } else {
          console.error('❌ Model retraining failed');
          resolve(NextResponse.json({
            success: false,
            message: 'Model retraining failed',
            error: errorOutput,
            output: output,
            code: code
          }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Error starting retraining process:', error);
        console.error('Script path:', scriptPath);
        console.error('Working directory:', path.join(process.cwd(), 'scripts'));
        resolve(NextResponse.json({
          success: false,
          message: 'Failed to start retraining process',
          error: error.message,
          scriptPath: scriptPath,
          cwd: path.join(process.cwd(), 'scripts')
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('❌ Retraining error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrain model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
