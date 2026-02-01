import { addWorkout, getWorkouts } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all workouts
export async function GET() {
  try {
    const workouts = await getWorkouts();
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// POST new workout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workout = await addWorkout(body);
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error adding workout:', error);
    return NextResponse.json({ error: 'Failed to add workout' }, { status: 500 });
  }
}