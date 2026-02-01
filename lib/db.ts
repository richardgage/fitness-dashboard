import { sql } from '@vercel/postgres';

export async function createWorkoutsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        duration INTEGER NOT NULL,
        distance DECIMAL(10, 2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Workouts table created successfully');
  } catch (error) {
    console.error('Error creating workouts table:', error);
    throw error;
  }
}

export async function addWorkout(workout: {
  date: string;
  type: string;
  duration: number;
  distance: number;
  notes: string;
}) {
  const { date, type, duration, distance, notes } = workout;
  const result = await sql`
    INSERT INTO workouts (date, type, duration, distance, notes)
    VALUES (${date}, ${type}, ${duration}, ${distance}, ${notes})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getWorkouts() {
  const result = await sql`
    SELECT * FROM workouts 
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function updateWorkout(id: number, workout: {
  date: string;
  type: string;
  duration: number;
  distance: number;
  notes: string;
}) {
  const { date, type, duration, distance, notes } = workout;
  const result = await sql`
    UPDATE workouts 
    SET date = ${date}, 
        type = ${type}, 
        duration = ${duration}, 
        distance = ${distance}, 
        notes = ${notes}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteWorkout(id: number) {
  await sql`
    DELETE FROM workouts 
    WHERE id = ${id}
  `;
}