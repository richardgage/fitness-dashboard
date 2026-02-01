# Fitness Training Dashboard

A full-stack web application for tracking workouts, analyzing training data, and monitoring fitness progress. Built with Next.js, React, TypeScript, and PostgreSQL.

🔗 **Live Demo**: [fitness-dashboard-pearl.vercel.app](https://fitness-dashboard-pearl.vercel.app)

## Features

### Workout Management
- **Manual Logging** - Record workouts with date, type, duration, distance, and notes
- **CSV Import** - Bulk upload workout history from CSV files
- **Full CRUD Operations** - Create, read, update, and delete workouts
- **Multiple Activity Types** - Track cycling, running, swimming, gym sessions, and more

### Analytics Dashboard
- **Summary Statistics** - Total workouts, time, distance, and weekly activity
- **Personal Records** - Longest workout, furthest distance, average duration
- **Data Visualizations**:
  - Activity distribution (pie chart)
  - 7-day training timeline (line chart)
  - Cumulative distance tracker (area chart)
  - Monthly training volume (bar chart)
- **Recent Activity Feed** - Quick view of latest workouts

### User Feedback System
- **Feature Requests** - Users can submit feedback and feature ideas
- **Admin Dashboard** - Review all feedback submissions

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts (data visualization)

**Backend**
- Next.js API Routes
- PostgreSQL (Neon)
- SQL queries via @vercel/postgres

**Deployment**
- Vercel (hosting & CI/CD)
- Automatic deployments from GitHub

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database or Neon account

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/fitness-dashboard.git
cd fitness-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:
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
# Then visit http://localhost:3000/api/init-db
# And http://localhost:3000/api/init-feedback
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Logging Workouts
Navigate to `/workouts` to manually log training sessions. Each workout can include:
- Date
- Activity type (cycling, running, swimming, gym, other)
- Duration in minutes
- Distance in kilometers (optional)
- Notes about the session

### Importing Data
Use `/import` to bulk upload workout history:
1. Download the CSV template
2. Add your workout data (one row per workout)
3. Upload the file
4. All workouts are imported to the database

### Viewing Analytics
The `/dashboard` displays:
- Key performance metrics
- Visual charts showing training trends
- Personal records and achievements
- Recent activity summary

### Submitting Feedback
Users can share feature requests or report issues at `/feedback`. Submissions are viewable at `/admin/feedback`.

## Project Structure
```
fitness-dashboard/
├── app/
│   ├── api/              # API routes
│   │   ├── workouts/     # Workout CRUD endpoints
│   │   ├── import/       # CSV import handler
│   │   ├── feedback/     # Feedback endpoints
│   │   ├── init-db/      # Database initialization
│   │   └── init-feedback/
│   ├── dashboard/        # Analytics page
│   ├── workouts/         # Workout logging page
│   ├── import/           # CSV import page
│   ├── feedback/         # User feedback page
│   ├── admin/            # Admin pages
│   │   └── feedback/     # View feedback submissions
│   ├── layout.tsx        # Root layout with navigation
│   └── page.tsx          # Homepage
├── lib/
│   └── db.ts            # Database utility functions
├── public/              # Static assets
└── README.md
```

## Database Schema

### Workouts Table
```sql
CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL,
  distance DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Feedback Table
```sql
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Future Enhancements

- [ ] Garmin API integration for automatic workout sync
- [ ] Heart rate zone tracking and analysis
- [ ] Training load and recovery metrics
- [ ] User authentication for multi-user support
- [ ] Progressive Web App (PWA) features for mobile
- [ ] Export data to CSV/PDF reports
- [ ] Detailed gym session tracking (sets/reps/weight)
- [ ] Social features (share workouts, compare with friends)


## Author

**Richard Gage**
- Computer Science Graduate, University of Victoria (2025)
- Philosophy Graduate
- GitHub: [richardgage](https://github.com/richardgage)

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built as a portfolio project to demonstrate full-stack development skills
- Deployed on Vercel with Neon PostgreSQL database
- Charts powered by Recharts library
