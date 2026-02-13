# Gym Training Tracker

A full-stack web application for comprehensive strength training tracking with detailed exercise, set, and rep logging. Built with Next.js, React, TypeScript, and PostgreSQL.

🔗 **Live Demo**: [fitness-dashboard-pearl.vercel.app](https://fitness-dashboard-pearl.vercel.app/)

## Overview

This project demonstrates professional full-stack development through a real-world application I built to solve my own gym tracking needs. The focus is on depth over breadth - building one feature comprehensively rather than many features superficially.

## Features

### Real-Time Workout Tracking
- **Active Session Management** - Start workout, log exercises in real-time, end session
- **Exercise Selection** - Quick dropdown selection from common exercises
- **Set Logging** - Track weight (lbs) and reps for each set
- **Rest Timer** - Configurable countdown timer (60s, 90s, 120s, 180s) between sets
- **Previous Workout Reference** - Automatically displays your last performance for the selected exercise
- **Session State Persistence** - Resume active workouts even after closing the browser

### Workout History & Analytics
- **Complete Workout History** - View all past training sessions
- **Detailed Workout View** - See every exercise, set, weight, and rep from any session
- **Volume Calculations** - Total weight lifted per exercise and workout
- **Performance Tracking** - Compare current performance to previous sessions

### Data Management
- **CSV Import** - Bulk upload workout history from spreadsheets
- **Full CRUD Operations** - Create, read, update, and delete workouts
- **User Feedback System** - Built-in feedback collection for feature requests

### Dashboard (Coming Soon)
- Aggregate statistics across all workouts
- Progressive overload visualization
- Training volume trends

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- Client-side state management for active workouts

### Backend
- **Next.js API Routes** (serverless functions)
- **PostgreSQL** via Neon (cloud database)
- RESTful API design

### Database Design
Three-table normalized structure demonstrating proper database design:
```
gym_sessions (workout metadata)
    ↓ one-to-many
gym_exercises (exercises within a session)
    ↓ one-to-many
gym_sets (individual sets with weight/reps)
```

This normalization eliminates data redundancy and enables efficient querying at multiple levels of granularity.

### Deployment & CI/CD
- **Vercel** for hosting with automatic deployments
- **GitHub** for version control
- Continuous deployment on every push to main

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository
```bash
git clone https://github.com/richard1gage/fitness-dashboard.git
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
1. Navigate to **Gym** from the homepage
2. Click **Start New Workout**
3. Select an exercise from the dropdown
4. Enter weight and reps for your first set
5. Click **Do Another Set** or **Switch Exercise**
6. Rest timer starts automatically after each set
7. Click **End Workout** when finished

### Viewing History
- Click **Show Workout History** from the Gym landing page
- Click any workout to see full details (all exercises and sets)

### Importing Data
- Navigate to **Import**
- Download the CSV template
- Add your workout data
- Upload and import

## Project Structure
```
fitness-dashboard/
├── app/
│   ├── api/              # API routes
│   │   ├── gym/          # Gym workout CRUD endpoints
│   │   ├── init-gym/     # Database initialization
│   │   ├── feedback/     # User feedback endpoints
│   │   └── import/       # CSV import handler
│   ├── gym/              # Gym tracking pages
│   │   ├── page.tsx      # Landing page
│   │   ├── active/       # Active workout interface
│   │   ├── history/      # Workout history list
│   │   └── workout/[id]/ # Individual workout details
│   ├── dashboard/        # Analytics dashboard
│   ├── import/           # CSV import page
│   ├── feedback/         # User feedback form
│   ├── admin/            # Admin pages
│   │   └── feedback/     # View feedback submissions
│   └── layout.tsx        # Root layout with navigation
├── lib/
│   └── db.ts            # Database utility functions
└── README.md
```

## Database Schema

### gym_sessions
Stores workout session metadata
```sql
CREATE TABLE gym_sessions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### gym_exercises
Links exercises to sessions
```sql
CREATE TABLE gym_exercises (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES gym_sessions(id) ON DELETE CASCADE,
  exercise_name VARCHAR(100) NOT NULL,
  exercise_order INTEGER
);
```

### gym_sets
Records individual sets
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

## Design Decisions

### Why Focus on Gym Tracking?

Initially considered multi-sport tracking (running, cycling, swimming), but decided to build one feature comprehensively rather than many features superficially. The gym tracker showcases:

- **Complex data relationships** - Three-table normalized structure with foreign keys
- **Real-time state management** - Active workout session persists across page refreshes
- **Practical UX design** - Built for actual use during workouts (rest timer, quick logging)
- **Progressive feature development** - Started with core functionality, iteratively added features

This approach demonstrates depth of technical understanding and product thinking more effectively than building multiple simple CRUD interfaces.

### Technical Highlights

**Database Normalization**: Properly normalized schema eliminates redundancy and enables flexible querying. For example, retrieving all bench press workouts across all sessions requires a simple JOIN rather than parsing denormalized data.

**Serverless Architecture**: Next.js API routes provide a scalable backend without managing servers. Each API endpoint is an independent serverless function.

**Type Safety**: TypeScript throughout the stack catches errors at compile-time and improves developer experience with autocomplete and type inference.

## Future Enhancements

- [ ] Progressive overload analytics (strength progression over time)
- [ ] Exercise-specific history and charts
- [ ] Workout templates (save and reuse common routines)
- [ ] Plate calculator (what plates = target weight?)
- [ ] Superset support (track multiple exercises in rotation)
- [ ] Mobile app (React Native/Progressive Web App)
- [ ] Exercise library with instructions/videos
- [ ] Body part frequency tracking

## Development Methodology

This project demonstrates professional software engineering practices:

- **Requirements Engineering** - Conducted user surveys to validate features
- **Iterative Development** - Built and deployed incrementally
- **Version Control** - Clean Git history with meaningful commits
- **CI/CD** - Automatic deployments via Vercel on every push
- **Database Design** - Normalized schema following best practices
- **API Design** - RESTful endpoints with proper HTTP methods

## Author

**Richard Gage**
- Computer Science Graduate, University of Victoria (2025)
- GitHub: [@richardgage](https://github.com/richardgage)
- Portfolio: [Live Demo](https://your-vercel-url.vercel.app)

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built as a portfolio project demonstrating full-stack development capabilities. The project showcases practical problem-solving, database design, and production-ready code quality.

---

**Note**: This application is optimized for desktop/laptop use. Mobile optimization is planned for future releases.