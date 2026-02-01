import { addFeedback, getFeedback } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET all feedback
export async function GET() {
  try {
    const feedback = await getFeedback();
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// POST new feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const feedback = await addFeedback(body);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json({ error: 'Failed to add feedback' }, { status: 500 });
  }
}