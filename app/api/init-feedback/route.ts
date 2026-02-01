import { createFeedbackTable } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createFeedbackTable();
    return NextResponse.json({ message: 'Feedback table initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize feedback table' }, { status: 500 });
  }
}