import { NextRequest, NextResponse } from 'next/server';
import { PythonShell } from 'python-shell';
import path from 'path';
import { beamAnalysisSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    // Validate the input data using the same schema as the frontend
    const validatedData = beamAnalysisSchema.parse(body);
    
    // Prepare the input for the Python script
    const inputData = {
      h_mm: validatedData.h_mm,
      d_mm: validatedData.d_mm,
      b_mm: validatedData.b_mm,
      a_mm: validatedData.a_mm,
      abyd: validatedData.abyd,
      fck_Mpa: validatedData.fck_Mpa,
      rho: validatedData.rho,
      fyk_Mpa: validatedData.fyk_Mpa,
      da_mm: validatedData.da_mm,
      Plate_Top_mm: validatedData.Plate_Top_mm,
      Plate_Bottom_mm: validatedData.Plate_Bottom_mm,
    };
    
    // Get the path to the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict.py');
    
    // Configure Python shell options
    const options = {
      mode: 'text' as const,
      pythonPath: 'python', // Use system Python
      pythonOptions: ['-u'], // Unbuffered output
      scriptPath: path.dirname(scriptPath),
    };
    
    // Send input data to Python script via stdin
    const pythonShell = new PythonShell(path.basename(scriptPath), options);
    pythonShell.send(JSON.stringify(inputData));
    
    const pythonResults = await new Promise<{ shearStrength: number; confidence: number; success?: boolean; error?: string }>((resolve, reject) => {
      pythonShell.on('message', (message) => {
        try {
          const result = JSON.parse(message);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python script output: ${parseError}`));
        }
      });
      
      pythonShell.on('error', (error) => {
        reject(error);
      });
      
      pythonShell.end((err) => {
        if (err) {
          reject(err);
        }
      });
    });
    
    // Check if the prediction was successful
    if (!pythonResults.success) {
      return NextResponse.json(
        { 
          error: pythonResults.error || 'Prediction failed',
          success: false 
        },
        { status: 400 }
      );
    }
    
    // Return the successful prediction
    return NextResponse.json({
      success: true,
      shearStrength: pythonResults.shearStrength,
      confidence: pythonResults.confidence,
      timestamp: new Date().toISOString(),
      inputData: validatedData
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.message,
          success: false 
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}
