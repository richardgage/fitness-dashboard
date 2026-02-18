import { createGymTables, createUsersTable, addUserIdToSessions } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createGymTables();
    await createUsersTable();
    await addUserIdToSessions();
    return NextResponse.json({ message: 'All tables initialized successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize tables' }, { status: 500 });
  }
}