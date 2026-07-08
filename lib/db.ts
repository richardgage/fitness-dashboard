import { sql } from '@vercel/postgres';

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
        start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
export async function startGymSession(date: string, userId: number) {
  try {
    const result = await sql`
    INSERT INTO gym_sessions (date, start_time, user_id)
    VALUES (${date}, CURRENT_TIMESTAMP, ${userId})
    RETURNING *
  `;
  return result.rows[0];
} catch (error) {
  console.error('Error starting gym session:', error);
  throw error;
}
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
  try {
    const result = await sql`
      INSERT INTO gym_exercises (session_id, exercise_name, exercise_order)
      VALUES (${sessionId}, ${exerciseName}, ${order})
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error('addExerciseToSession error:', error)
    throw error
  }
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
export async function getActiveSession(userId: number) {
  const result = await sql`
    SELECT * FROM gym_sessions 
    WHERE end_time IS NULL AND user_id = ${userId}
    ORDER BY start_time DESC 
    LIMIT 1
  `;
  return result.rows[0] || null;
}

// Get session with all exercises and sets
export async function getSessionDetails(sessionId: number, userId: number) {
  const session = await sql`
    SELECT s.*, u.email, u.display_name
    FROM gym_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
    AND (
      s.user_id = ${userId}
      OR EXISTS (
        SELECT 1 FROM friend_requests fr
        WHERE fr.status = 'accepted'
        AND (
          (fr.sender_id = ${userId} AND fr.receiver_id = s.user_id)
          OR (fr.receiver_id = ${userId} AND fr.sender_id = s.user_id)
        )
      )
    )
  `;

  if (!session.rows[0]) return null;

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
export async function getAllGymSessions(userId: number) {
  const result = await sql`
    SELECT 
      s.*,
      COUNT(DISTINCT e.id) as exercise_count,
      COUNT(se.id) as total_sets
    FROM gym_sessions s
    LEFT JOIN gym_exercises e ON s.id = e.session_id
    LEFT JOIN gym_sets se ON e.id = se.exercise_id
    WHERE s.end_time IS NOT NULL
    AND s.user_id = ${userId}
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

// Gym dashboard stats
export async function getGymDashboardStats(userId: number) {
  const result = await sql`
    SELECT
      COUNT(DISTINCT s.id)::int as total_sessions,
      COUNT(DISTINCT CASE WHEN s.date >= CURRENT_DATE - INTERVAL '7 days' THEN s.id END)::int as sessions_this_week,
      COUNT(DISTINCT CASE WHEN s.date >= CURRENT_DATE - INTERVAL '30 days' THEN s.id END)::int as sessions_this_month,
      COALESCE(SUM(gs.weight * gs.reps), 0)::numeric as total_volume,
      COALESCE(SUM(CASE WHEN s.date >= CURRENT_DATE - INTERVAL '7 days' THEN gs.weight * gs.reps ELSE 0 END), 0)::numeric as volume_this_week,
      COUNT(gs.id)::int as total_sets,
      COUNT(DISTINCT e.exercise_name)::int as unique_exercises,
      COALESCE(MAX(gs.weight), 0)::numeric as heaviest_weight,
      (
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time))), 0)
        FROM gym_sessions
        WHERE end_time IS NOT NULL AND user_id = ${userId}
      )::int as avg_duration_seconds
    FROM gym_sessions s
    LEFT JOIN gym_exercises e ON s.id = e.session_id
    LEFT JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.end_time IS NOT NULL
    AND s.user_id = ${userId}
  `;
  return result.rows[0];
}

export async function getExerciseFrequency(userId: number) {
  const result = await sql`
    SELECT
      e.exercise_name as name,
      COUNT(DISTINCT e.session_id)::int as session_count,
      COUNT(gs.id)::int as total_sets,
      COALESCE(SUM(gs.weight * gs.reps), 0)::numeric as total_volume
    FROM gym_exercises e
    JOIN gym_sessions s ON e.session_id = s.id
    LEFT JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.end_time IS NOT NULL
    AND s.user_id = ${userId}
    GROUP BY e.exercise_name
    ORDER BY session_count DESC
  `;
  return result.rows;
}

export async function getVolumeOverTime(userId: number) {
  const result = await sql`
    SELECT
      s.id as session_id,
      s.date,
      COALESCE(SUM(gs.weight * gs.reps), 0)::numeric as session_volume,
      COUNT(DISTINCT e.id)::int as exercise_count,
      COUNT(gs.id)::int as set_count
    FROM gym_sessions s
    LEFT JOIN gym_exercises e ON s.id = e.session_id
    LEFT JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.end_time IS NOT NULL
    AND s.user_id = ${userId}
    GROUP BY s.id, s.date
    ORDER BY s.date ASC
  `;
  return result.rows;
}

export async function createUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function addUserIdToSessions() {
  await sql`
    ALTER TABLE gym_sessions 
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `
}

export async function createUser(email: string, hashedPassword: string, displayName: string) {
  const result = await sql`
    INSERT INTO users (email, password, display_name)
    VALUES (${email}, ${hashedPassword}, ${displayName})
    RETURNING id, email, display_name, created_at
  `
  return result.rows[0]
}

export async function getUserById(userId: number) {
  const result = await sql`
    SELECT id, email, display_name FROM users WHERE id = ${userId}
  `
  return result.rows[0] || null
}

export async function updateDisplayName(userId: number, displayName: string) {
  const result = await sql`
    UPDATE users SET display_name = ${displayName}
    WHERE id = ${userId}
    RETURNING id, email, display_name
  `
  return result.rows[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return result.rows[0] || null
}

export async function getUserIdByEmail(email: string) {
  const result = await sql`
    SELECT id FROM users WHERE email = ${email}
  `
  return result.rows[0]?.id || null
}

export async function getUserExercises(userId: number) {
  const result = await sql`
    SELECT exercise_name FROM user_exercises
    WHERE user_id = ${userId}
    ORDER BY exercise_name ASC
  `
  return result.rows.map((row: any) => row.exercise_name)
}

export async function addUserExercise(userId: number, exerciseName: string) {
  const result = await sql`
    INSERT INTO user_exercises (user_id, exercise_name)
    VALUES (${userId}, ${exerciseName})
    ON CONFLICT DO NOTHING
    RETURNING *
  `
  return result.rows[0]
}

export async function createUserExercisesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_exercises (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      exercise_name VARCHAR(100) NOT NULL,
      UNIQUE(user_id, exercise_name)
    )
  `
}

export async function createFriendRequestsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sender_id, receiver_id)
    )
  `
}

export async function sendFriendRequest(senderId: number, receiverId: number) {
  const result = await sql`
    INSERT INTO friend_requests (sender_id, receiver_id)
    VALUES (${senderId}, ${receiverId})
    ON CONFLICT DO NOTHING
    RETURNING *
  `
  return result.rows[0]
}

export async function acceptFriendRequest(requestId: number, userId: number) {
  const result = await sql`
    UPDATE friend_requests
    SET status = 'accepted'
    WHERE id = ${requestId}
    AND receiver_id = ${userId}
    RETURNING *
  `
  return result.rows[0]
}

export async function declineFriendRequest(requestId: number, userId: number) {
  const result = await sql`
    UPDATE friend_requests
    SET status = 'declined'
    WHERE id = ${requestId}
    AND receiver_id = ${userId}
    RETURNING *
  `
  return result.rows[0]
}

export async function getPendingFriendRequests(userId: number) {
  const result = await sql`
    SELECT fr.*, u.email as sender_email, u.display_name as sender_display_name
    FROM friend_requests fr
    JOIN users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = ${userId}
    AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `
  return result.rows
}

export async function getFriends(userId: number) {
  const result = await sql`
    SELECT u.id, u.email, u.display_name
    FROM friend_requests fr
    JOIN users u ON (
      CASE 
        WHEN fr.sender_id = ${userId} THEN fr.receiver_id = u.id
        ELSE fr.sender_id = u.id
      END
    )
    WHERE (fr.sender_id = ${userId} OR fr.receiver_id = ${userId})
    AND fr.status = 'accepted'
  `
  return result.rows
}

export async function getFriendStats(friendId: number) {
  const sessions = await sql`
    SELECT
      COUNT(DISTINCT CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN id END)::int as sessions_this_week,
      COUNT(DISTINCT CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN id END)::int as sessions_this_month
    FROM gym_sessions
    WHERE user_id = ${friendId}
    AND end_time IS NOT NULL
  `

  const prs = await sql`
    SELECT
      e.exercise_name,
      MAX(gs.weight)::numeric as max_weight
    FROM gym_exercises e
    JOIN gym_sessions s ON e.session_id = s.id
    JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.user_id = ${friendId}
    AND s.end_time IS NOT NULL
    GROUP BY e.exercise_name
    ORDER BY max_weight DESC
    LIMIT 5
  `

  return {
    sessions: sessions.rows[0],
    prs: prs.rows
  }
}

// Best set per session for a given exercise — powers the progression chart
export async function getExerciseProgression(userId: number, exerciseName: string) {
  const result = await sql`
    SELECT DISTINCT ON (s.id)
      s.date,
      s.id as session_id,
      gs.weight::numeric as top_weight,
      gs.reps::int as top_reps
    FROM gym_exercises e
    JOIN gym_sessions s ON e.session_id = s.id
    JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.user_id = ${userId}
      AND s.end_time IS NOT NULL
      AND e.exercise_name = ${exerciseName}
    ORDER BY s.id, gs.weight DESC, gs.reps DESC
  `
  return result.rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// All-time summary for a given exercise
export async function getExerciseSummary(userId: number, exerciseName: string) {
  const result = await sql`
    SELECT
      COUNT(DISTINCT s.id)::int as total_sessions,
      COUNT(gs.id)::int as total_sets,
      COALESCE(SUM(gs.weight * gs.reps), 0)::numeric as total_volume,
      COALESCE(MAX(gs.weight), 0)::numeric as pr_weight,
      COALESCE(AVG(gs.weight), 0)::numeric as avg_weight
    FROM gym_exercises e
    JOIN gym_sessions s ON e.session_id = s.id
    JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.user_id = ${userId}
      AND s.end_time IS NOT NULL
      AND e.exercise_name = ${exerciseName}
  `
  return result.rows[0]
}

// Combined chronological feed: your workouts + your friends' workouts
export async function getActivityFeed(userId: number, limit: number = 30) {
  const result = await sql`
    WITH my_friends AS (
      SELECT CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END as friend_id
      FROM friend_requests
      WHERE (sender_id = ${userId} OR receiver_id = ${userId})
      AND status = 'accepted'
    )
    SELECT
      s.id,
      s.date,
      s.start_time,
      s.end_time,
      s.user_id,
      u.email,
      u.display_name,
      (s.user_id = ${userId}) as is_mine,
      EXTRACT(EPOCH FROM (s.end_time - s.start_time))::int as duration_seconds,
      COUNT(DISTINCT e.id)::int as exercise_count,
      COUNT(gs.id)::int as total_sets,
      COALESCE(SUM(gs.weight * gs.reps), 0)::numeric as total_volume,
      COALESCE(
        json_agg(DISTINCT e.exercise_name) FILTER (WHERE e.exercise_name IS NOT NULL),
        '[]'
      ) as exercise_names
    FROM gym_sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN gym_exercises e ON s.id = e.session_id
    LEFT JOIN gym_sets gs ON e.id = gs.exercise_id
    WHERE s.end_time IS NOT NULL
    AND (s.user_id = ${userId} OR s.user_id IN (SELECT friend_id FROM my_friends))
    GROUP BY s.id, s.date, s.start_time, s.end_time, s.user_id, u.email, u.display_name
    ORDER BY s.start_time DESC
    LIMIT ${limit}
  `
  return result.rows
}