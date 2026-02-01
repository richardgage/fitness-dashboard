import { createWorkoutsTable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createWorkoutsTable();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}