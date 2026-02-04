import { addCycle, getCycles, updateCycle, deleteCycle } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cycles = await getCycles();
    return NextResponse.json(cycles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cycles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cycle = await addCycle(body);
    return NextResponse.json(cycle);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add cycle' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...cycleData } = body;
    const cycle = await updateCycle(id, cycleData);
    return NextResponse.json(cycle);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cycle' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await deleteCycle(parseInt(id));
    return NextResponse.json({ message: 'Cycle deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cycle' }, { status: 500 });
  }
}