import { createRunsTable, createCyclesTable, createSwimsTable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createRunsTable();
    await createCyclesTable();
    await createSwimsTable();
    return NextResponse.json({ message: 'Cardio tables initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize cardio tables' }, { status: 500 });
  }
}