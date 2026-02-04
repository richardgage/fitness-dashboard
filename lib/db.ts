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

export async function createFeedbackTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Feedback table created successfully');
  } catch (error) {
    console.error('Error creating feedback table:', error);
    throw error;
  }
}

export async function addFeedback(feedback: {
  message: string;
  email?: string;
}) {
  const { message, email } = feedback;
  const result = await sql`
    INSERT INTO feedback (message, email)
    VALUES (${message}, ${email || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getFeedback() {
  const result = await sql`
    SELECT * FROM feedback 
    ORDER BY created_at DESC
  `;
  return result.rows;
}

// Gym session functions
export async function createGymTables() {
  try {
    // Create gym_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS gym_sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create gym_exercises table
    await sql`
      CREATE TABLE IF NOT EXISTS gym_exercises (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES gym_sessions(id) ON DELETE CASCADE,
        exercise_name VARCHAR(100) NOT NULL,
        exercise_order INTEGER
      )
    `;

    // Create gym_sets table
    await sql`
      CREATE TABLE IF NOT EXISTS gym_sets (
        id SERIAL PRIMARY KEY,
        exercise_id INTEGER REFERENCES gym_exercises(id) ON DELETE CASCADE,
        set_number INTEGER NOT NULL,
        weight DECIMAL(6,2) NOT NULL,
        reps INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Gym tables created successfully');
  } catch (error) {
    console.error('Error creating gym tables:', error);
    throw error;
  }
}

// Start a new gym session
export async function startGymSession(date: string) {
  const result = await sql`
    INSERT INTO gym_sessions (date, start_time)
    VALUES (${date}, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  return result.rows[0];
}

// End a gym session
export async function endGymSession(sessionId: number, notes?: string) {
  const result = await sql`
    UPDATE gym_sessions 
    SET end_time = CURRENT_TIMESTAMP, notes = ${notes || null}
    WHERE id = ${sessionId}
    RETURNING *
  `;
  return result.rows[0];
}

// Add exercise to session
export async function addExerciseToSession(sessionId: number, exerciseName: string, order: number) {
  const result = await sql`
    INSERT INTO gym_exercises (session_id, exercise_name, exercise_order)
    VALUES (${sessionId}, ${exerciseName}, ${order})
    RETURNING *
  `;
  return result.rows[0];
}

// Add set to exercise
export async function addSetToExercise(exerciseId: number, setNumber: number, weight: number, reps: number) {
  const result = await sql`
    INSERT INTO gym_sets (exercise_id, set_number, weight, reps)
    VALUES (${exerciseId}, ${setNumber}, ${weight}, ${reps})
    RETURNING *
  `;
  return result.rows[0];
}

// Get active session (not ended)
export async function getActiveSession() {
  const result = await sql`
    SELECT * FROM gym_sessions 
    WHERE end_time IS NULL 
    ORDER BY start_time DESC 
    LIMIT 1
  `;
  return result.rows[0] || null;
}

// Get session with all exercises and sets
export async function getSessionDetails(sessionId: number) {
  const session = await sql`
    SELECT * FROM gym_sessions WHERE id = ${sessionId}
  `;
  
  const exercises = await sql`
    SELECT e.*, 
           json_agg(
             json_build_object(
               'id', s.id,
               'set_number', s.set_number,
               'weight', s.weight,
               'reps', s.reps,
               'completed_at', s.completed_at
             ) ORDER BY s.set_number
           ) as sets
    FROM gym_exercises e
    LEFT JOIN gym_sets s ON e.id = s.exercise_id
    WHERE e.session_id = ${sessionId}
    GROUP BY e.id
    ORDER BY e.exercise_order
  `;

  return {
    ...session.rows[0],
    exercises: exercises.rows
  };
}

// Get all past sessions
export async function getAllGymSessions() {
  const result = await sql`
    SELECT 
      s.*,
      COUNT(DISTINCT e.id) as exercise_count,
      COUNT(se.id) as total_sets
    FROM gym_sessions s
    LEFT JOIN gym_exercises e ON s.id = e.session_id
    LEFT JOIN gym_sets se ON e.id = se.exercise_id
    WHERE s.end_time IS NOT NULL
    GROUP BY s.id
    ORDER BY s.date DESC
  `;
  return result.rows;
}

// Get last workout for specific exercise
export async function getLastWorkoutForExercise(exerciseName: string) {
  const result = await sql`
    SELECT 
      e.exercise_name,
      s.date,
      json_agg(
        json_build_object(
          'set_number', gs.set_number,
          'weight', gs.weight,
          'reps', gs.reps
        ) ORDER BY gs.set_number
      ) as sets
    FROM gym_exercises e
    JOIN gym_sessions s ON e.session_id = s.id
    JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE e.exercise_name = ${exerciseName}
      AND s.end_time IS NOT NULL
    GROUP BY e.id, e.exercise_name, s.date
    ORDER BY s.date DESC
    LIMIT 1
  `;
  return result.rows[0] || null;
}

// Create running table
export async function createRunsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS runs (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        distance_km DECIMAL(6,2) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Runs table created successfully');
  } catch (error) {
    console.error('Error creating runs table:', error);
    throw error;
  }
}

// Create cycling table
export async function createCyclesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cycles (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        distance_km DECIMAL(6,2) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Cycles table created successfully');
  } catch (error) {
    console.error('Error creating cycles table:', error);
    throw error;
  }
}

// Create swimming table
export async function createSwimsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS swims (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        distance_m INTEGER NOT NULL,
        duration_minutes INTEGER NOT NULL,
        stroke_type VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Swims table created successfully');
  } catch (error) {
    console.error('Error creating swims table:', error);
    throw error;
  }
}

// Running functions
export async function addRun(run: {
  date: string;
  distance_km: number;
  duration_minutes: number;
  notes?: string;
}) {
  const { date, distance_km, duration_minutes, notes } = run;
  const result = await sql`
    INSERT INTO runs (date, distance_km, duration_minutes, notes)
    VALUES (${date}, ${distance_km}, ${duration_minutes}, ${notes || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getRuns() {
  const result = await sql`
    SELECT * FROM runs 
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function updateRun(id: number, run: {
  date: string;
  distance_km: number;
  duration_minutes: number;
  notes?: string;
}) {
  const { date, distance_km, duration_minutes, notes } = run;
  const result = await sql`
    UPDATE runs 
    SET date = ${date}, 
        distance_km = ${distance_km}, 
        duration_minutes = ${duration_minutes}, 
        notes = ${notes || null}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteRun(id: number) {
  await sql`DELETE FROM runs WHERE id = ${id}`;
}

// Cycling functions
export async function addCycle(cycle: {
  date: string;
  distance_km: number;
  duration_minutes: number;
  notes?: string;
}) {
  const { date, distance_km, duration_minutes, notes } = cycle;
  const result = await sql`
    INSERT INTO cycles (date, distance_km, duration_minutes, notes)
    VALUES (${date}, ${distance_km}, ${duration_minutes}, ${notes || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getCycles() {
  const result = await sql`
    SELECT * FROM cycles 
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function updateCycle(id: number, cycle: {
  date: string;
  distance_km: number;
  duration_minutes: number;
  notes?: string;
}) {
  const { date, distance_km, duration_minutes, notes } = cycle;
  const result = await sql`
    UPDATE cycles 
    SET date = ${date}, 
        distance_km = ${distance_km}, 
        duration_minutes = ${duration_minutes}, 
        notes = ${notes || null}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteCycle(id: number) {
  await sql`DELETE FROM cycles WHERE id = ${id}`;
}

// Swimming functions
export async function addSwim(swim: {
  date: string;
  distance_m: number;
  duration_minutes: number;
  stroke_type?: string;
  notes?: string;
}) {
  const { date, distance_m, duration_minutes, stroke_type, notes } = swim;
  const result = await sql`
    INSERT INTO swims (date, distance_m, duration_minutes, stroke_type, notes)
    VALUES (${date}, ${distance_m}, ${duration_minutes}, ${stroke_type || null}, ${notes || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getSwims() {
  const result = await sql`
    SELECT * FROM swims 
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function updateSwim(id: number, swim: {
  date: string;
  distance_m: number;
  duration_minutes: number;
  stroke_type?: string;
  notes?: string;
}) {
  const { date, distance_m, duration_minutes, stroke_type, notes } = swim;
  const result = await sql`
    UPDATE swims 
    SET date = ${date}, 
        distance_m = ${distance_m}, 
        duration_minutes = ${duration_minutes}, 
        stroke_type = ${stroke_type || null},
        notes = ${notes || null}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function deleteSwim(id: number) {
  await sql`DELETE FROM swims WHERE id = ${id}`;
}