# Gym Training Tracker

A full-stack web application for comprehensive strength training tracking with detailed exercise, set, and rep logging. Built with Next.js, React, TypeScript, and PostgreSQL.

🔗 **Live Demo**: [fitness-dashboard-pearl.vercel.app](https://fitness-dashboard-pearl.vercel.app/)

## Overview

This project demonstrates professional full-stack development through a real-world application I built to solve my own gym tracking needs. The focus is on depth over breadth - building one feature comprehensively rather than many features superficially.

## Features

### User Authentication
- **Account Registration** - Create an account with email and password
- **Secure Login** - JWT-based sessions via NextAuth.js
- **Protected Routes** - Gym and dashboard pages require authentication
- **User Isolation** - Each user only sees their own workout data

### Real-Time Workout Tracking
- **Active Session Management** - Start workout, log exercises in real-time, end session
- **Exercise Selection** - Quick dropdown selection from 31 common exercises
- **Custom Exercises** - Create and save your own exercises
- **Set Logging** - Track weight (lbs) and reps for each set
- **Rest Timer** - Configurable countdown timer (60s, 90s, 120s, 180s) with audio notification
- **Previous Workout Reference** - Automatically displays your last performance for the selected exercise
- **Session State Persistence** - Resume active workouts even after closing the browser

### Workout History & Analytics
- **Complete Workout History** - View all past training sessions
- **Detailed Workout View** - See every exercise, set, weight, and rep from any session
- **Volume Calculations** - Total weight lifted per exercise and workout
- **Session Duration** - Tracks workout length in hours and minutes

### Dashboard
- **Aggregate Statistics** - Total sessions, this week/month counts, total volume, heaviest lift
- **Volume Trends** - Area chart tracking session volume over last 20 sessions
- **Monthly Volume** - Bar chart breakdown by month (last 6 months)
- **Exercise Frequency** - Pie chart showing most-used exercises
- **Top Exercises by Volume** - Horizontal bar chart of top 6 exercises
- **Recent Workouts** - Quick links to 5 most recent sessions

### Data Management
- **Full CRUD Operations** - Create, read, update, and delete workouts
- **User Feedback System** - Built-in feedback collection for feature requests

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19** with TypeScript
- **Recharts 3** for data visualization
- **Tailwind CSS 4** for styling

### Backend
- **Next.js API Routes** (serverless functions)
- **NextAuth.js** for authentication
- **bcryptjs** for password hashing
- **PostgreSQL** via Vercel Postgres

### Database Design
Normalized relational structure:
```
users
    ↓ one-to-many
gym_sessions (workout metadata)
    ↓ one-to-many
gym_exercises (exercises within a session)
    ↓ one-to-many
gym_sets (individual sets with weight/reps)

users
    ↓ one-to-many
user_exercises (custom saved exercises)
```

### Deployment
- **Vercel** for hosting with automatic deployments
- **GitHub** for version control
- Continuous deployment on every push to main

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Vercel Postgres)

### Installation

1. Clone the repository
```bash
git clone https://github.com/richardgage/fitness-dashboard.git
cd fitness-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file:
```env
POSTGRES_URL="your_postgres_connection_string"
POSTGRES_PRISMA_URL="your_prisma_connection_string"
POSTGRES_URL_NON_POOLING="your_non_pooling_connection_string"
POSTGRES_USER="your_user"
POSTGRES_HOST="your_host"
POSTGRES_PASSWORD="your_password"
POSTGRES_DATABASE="your_database"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database
```bash
npm run dev
# Visit http://localhost:3000/api/init-gym in your browser
```

5. Start the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Starting a Workout
1. Log in or create an account
2. Navigate to **Gym** from the homepage
3. Click **Start New Workout**
4. Select an exercise from the dropdown (or create a custom one)
5. Enter weight and reps for your first set
6. Click **Do Another Set** or **Switch Exercise**
7. Rest timer starts automatically after each set
8. Click **End Workout** when finished

### Viewing History
- Click **Show Workout History** from the Gym landing page
- Click any workout to see full details (all exercises and sets)

## Project Structure
```
fitness-dashboard/
├── app/
│   ├── page.tsx              # Home landing page
│   ├── layout.tsx            # Root layout with Nav + Providers
│   ├── NavBar.tsx            # Navigation component
│   ├── Providers.tsx         # NextAuth SessionProvider
│   ├── gym/                  # Gym tracking pages
│   │   ├── page.tsx          # Landing page
│   │   ├── active/           # Active workout interface
│   │   ├── history/          # Workout history list
│   │   └── workout/[id]/     # Individual workout details
│   ├── dashboard/            # Analytics dashboard
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── feedback/             # User feedback form
│   ├── admin/
│   │   └── feedback/         # View feedback submissions
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler + config
│       ├── gym/              # Workout CRUD endpoints
│       ├── register/         # User registration
│       ├── feedback/         # Feedback endpoints
│       └── init-gym/         # Database initialization
├── lib/
│   └── db.ts                 # Database utility functions
├── middleware.ts              # Route protection
└── README.md
```

## Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### gym_sessions
```sql
CREATE TABLE gym_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### gym_exercises
```sql
CREATE TABLE gym_exercises (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES gym_sessions(id) ON DELETE CASCADE,
  exercise_name VARCHAR(100) NOT NULL,
  exercise_order INTEGER
);
```

### gym_sets
```sql
CREATE TABLE gym_sets (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES gym_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_exercises
```sql
CREATE TABLE user_exercises (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exercise_name VARCHAR(100) NOT NULL,
  UNIQUE(user_id, exercise_name)
);
```

## Future Enhancements

- [ ] Progressive overload analytics (strength progression over time)
- [ ] Exercise-specific history and charts
- [ ] Workout templates (save and reuse common routines)
- [ ] Plate calculator (what plates = target weight?)
- [ ] Superset support (track multiple exercises in rotation)
- [ ] Mobile optimization / Progressive Web App
- [ ] Exercise library with instructions/videos
- [ ] Body part frequency tracking

## Author

**Richard Gage**
- Computer Science Graduate, University of Victoria (2025)
- GitHub: [@richardgage](https://github.com/richardgage)
- Portfolio: [Live Demo](https://fitness-dashboard-pearl.vercel.app/)

## License

This project is open source and available under the MIT License.
