import { addRun, getRuns, updateRun, deleteRun } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const runs = await getRuns();
    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const run = await addRun(body);
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add run' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...runData } = body;
    const run = await updateRun(id, runData);
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update run' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await deleteRun(parseInt(id));
    return NextResponse.json({ message: 'Run deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete run' }, { status: 500 });
  }
}