import { createGymTables, createUsersTable, addUserIdToSessions, createUserExercisesTable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createUsersTable();
    await createGymTables();
    await addUserIdToSessions();
    await createUserExercisesTable();
    return NextResponse.json({ message: 'All tables initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize tables' }, { status: 500 });
  }
}