import { createGymTables } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createGymTables();
    return NextResponse.json({ message: 'Gym tables initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize gym tables' }, { status: 500 });
  }
}