import { addWorkout } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { csvData } = await request.json();
    
    // Parse CSV
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    // Validate headers
    const requiredHeaders = ['date', 'type', 'duration'];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
    
    if (!hasRequiredHeaders) {
      return NextResponse.json({
        success: 0,
        errors: [`CSV must have columns: ${requiredHeaders.join(', ')}`]
      }, { status: 400 });
    }
    
    let successCount = 0;
    const errors: string[] = [];
    
    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      try {
        const values = line.split(',').map((v: string) => v.trim());
        const workout: any = {};
        
        headers.forEach((header: string,index: number) => {
          workout[header] = values[index] || '';
        });
        
        // Validate required fields
        if (!workout.date || !workout.type || !workout.duration) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Convert types
        const workoutData = {
          date: workout.date,
          type: workout.type.toLowerCase(),
          duration: parseInt(workout.duration),
          distance: parseFloat(workout.distance) || 0,
          notes: workout.notes || ''
        };
        
        // Validate data
        if (isNaN(workoutData.duration)) {
          errors.push(`Row ${i + 1}: Invalid duration`);
          continue;
        }
        
        // Add to database
        await addWorkout(workoutData);
        successCount++;
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      success: successCount,
      errors
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: 0,
      errors: ['Failed to process CSV file']
    }, { status: 500 });
  }
}