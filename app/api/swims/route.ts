import { addSwim, getSwims, updateSwim, deleteSwim } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const swims = await getSwims();
    return NextResponse.json(swims);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch swims' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const swim = await addSwim(body);
    return NextResponse.json(swim);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add swim' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...swimData } = body;
    const swim = await updateSwim(id, swimData);
    return NextResponse.json(swim);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update swim' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await deleteSwim(parseInt(id));
    return NextResponse.json({ message: 'Swim deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete swim' }, { status: 500 });
  }
}