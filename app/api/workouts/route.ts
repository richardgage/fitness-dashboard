import { addWorkout, getWorkouts, updateWorkout, deleteWorkout } from '@/lib/db';
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

// PUT (update) workout
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...workoutData } = body;
    const workout = await updateWorkout(id, workoutData);
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

// DELETE workout
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await deleteWorkout(parseInt(id));
    return NextResponse.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}