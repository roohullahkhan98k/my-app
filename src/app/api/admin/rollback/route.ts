import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(): Promise<NextResponse> {
  try {
    console.log('🔄 Starting model rollback to original version...');
    
    // Path to the rollback script
    const scriptPath = path.join(process.cwd(), 'scripts', 'rollback_model.py');
    
    return new Promise<NextResponse>((resolve) => {
      // Run the Python rollback script
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
          console.log('✅ Model rollback completed successfully');
          resolve(NextResponse.json({
            success: true,
            message: 'Model rolled back to original version successfully',
            output: output,
            code: code
          }));
        } else {
          console.error('❌ Model rollback failed');
          resolve(NextResponse.json({
            success: false,
            message: 'Model rollback failed',
            error: errorOutput,
            output: output,
            code: code
          }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Error starting rollback process:', error);
        resolve(NextResponse.json({
          success: false,
          message: 'Failed to start rollback process',
          error: error.message
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('❌ Rollback error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to rollback model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
