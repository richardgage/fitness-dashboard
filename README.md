# Fitness Training Dashboard

A full-stack web application for tracking workouts and monitoring training progress. Built with Next.js, React, TypeScript, and PostgreSQL.

## Features

- **Workout Logging** - Record workouts with date, type, duration, distance, and notes
- **Dashboard Analytics** - View training statistics and visualizations
- **CSV Import** - Bulk upload workout history from CSV files
- **CRUD Operations** - Create, read, update, and delete workouts
- **Data Visualization** - Charts showing workout distribution and weekly activity trends

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon account)

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

Create a `.env.local` file in the root directory with your database credentials:
```
DATABASE_URL="your_postgres_connection_string"
```

4. Initialize the database
```bash
# Run the app and visit http://localhost:3000/api/init-db
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Logging Workouts
Navigate to the Workouts page to manually log individual training sessions.

### Importing Data
Use the Import page to bulk upload workout history from a CSV file. Download the template for the correct format.

### Viewing Analytics
The Dashboard displays summary statistics and visualizations of your training data.

## Project Structure
```
fitness-dashboard/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── import/       # CSV import page
│   │   ├── workouts/     # Workout logging page
│   │   └── layout.tsx    # Root layout with navigation
│   └── lib/
│       └── db.ts         # Database utility functions
├── public/               # Static assets
└── package.json
```

## Future Enhancements

- [ ] Garmin API integration for automatic workout sync
- [ ] Heart rate zone tracking and analysis
- [ ] Training load calculations
- [ ] User authentication and multi-user support
- [ ] Mobile responsive design improvements
- [ ] Export data to CSV/PDF reports

## Author

**Richard Gage** - Recent Computer Science graduate from University of Victoria


## License

This project is open source and available under the MIT License.
