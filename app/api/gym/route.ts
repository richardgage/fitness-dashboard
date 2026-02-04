import { 
    startGymSession, 
    endGymSession, 
    getActiveSession, 
    getSessionDetails,
    getAllGymSessions,
    addExerciseToSession,
    addSetToExercise,
    getLastWorkoutForExercise
  } from '@/lib/db';
  import { NextResponse } from 'next/server';
  
  // GET active session or all sessions
  export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');
      const sessionId = searchParams.get('sessionId');
      const exerciseName = searchParams.get('exerciseName');
  
      if (action === 'active') {
        const session = await getActiveSession();
        if (session) {
          const details = await getSessionDetails(session.id);
          return NextResponse.json(details);
        }
        return NextResponse.json(null);
      }
  
      if (action === 'details' && sessionId) {
        const details = await getSessionDetails(parseInt(sessionId));
        return NextResponse.json(details);
      }
  
      if (action === 'lastWorkout' && exerciseName) {
        const lastWorkout = await getLastWorkoutForExercise(exerciseName);
        return NextResponse.json(lastWorkout);
      }
  
      // Default: get all past sessions
      const sessions = await getAllGymSessions();
      return NextResponse.json(sessions);
    } catch (error) {
      console.error('Error fetching gym data:', error);
      return NextResponse.json({ error: 'Failed to fetch gym data' }, { status: 500 });
    }
  }
  
  // POST - Start session, add exercise, or add set
  export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { action } = body;
  
      if (action === 'startSession') {
        const session = await startGymSession(body.date);
        return NextResponse.json(session);
      }
  
      if (action === 'addExercise') {
        const exercise = await addExerciseToSession(
          body.sessionId,
          body.exerciseName,
          body.order
        );
        return NextResponse.json(exercise);
      }
  
      if (action === 'addSet') {
        const set = await addSetToExercise(
          body.exerciseId,
          body.setNumber,
          body.weight,
          body.reps
        );
        return NextResponse.json(set);
      }
  
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
      console.error('Error in gym POST:', error);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
  }
  
  // PUT - End session
  export async function PUT(request: Request) {
    try {
      const body = await request.json();
      const { sessionId, notes } = body;
      const session = await endGymSession(sessionId, notes);
      return NextResponse.json(session);
    } catch (error) {
      console.error('Error ending session:', error);
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }
  }