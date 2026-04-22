# EduManage - School Management System

A comprehensive school management system built with React, featuring student and teacher dashboards, news, resources, and team pages with authentication.

## Features

- **Authentication System**: Login and Register functionality with protected routes
- **Home Page**: Landing page with features overview
- **About Page**: Information about the platform
- **Services Page**: Detailed list of services offered
- **Resources Page**: Video tutorials explaining how the system works
- **Team Page**: Staff member cards with contact information
- **News Page**: Latest news and announcements with detail views
- **Student Dashboard**: Comprehensive analytics and student data
- **Teacher Dashboard**: Faculty directory and performance metrics


## Getting Started

### Prerequisites

Make sure you have Node.js and pnpm installed.

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the JSON Server (in a separate terminal):
```bash
npx json-server --watch db.json --port 3001
```

This will start the mock API server on `http://localhost:3001` with the following endpoints:
- `/users` - User authentication data
- `/students` - Student information
- `/teachers` - Teacher information
- `/news` - News articles
- `/team` - Team members
- `/resources` - Video resources
- `/performanceData` - Student performance metrics
- `/gradeDistribution` - Grade statistics
- `/attendanceTrend` - Attendance data

3. Start the development server (in another terminal):
```bash
pnpm run dev
```

## Demo Credentials

You can use these credentials to test the system:

**Student Account:**
- Email: student@edu.com
- Password: student123

**Teacher Account:**
- Email: teacher@edu.com
- Password: teacher123

**Admin Account:**
- Email: admin@edu.com
- Password: admin123

Or register a new account using the registration form.

## Project Structure

```
/src
  /app
    /components
      - HomePage.tsx
      - Login.tsx
      - Register.tsx
      - Portal.tsx
      - About.tsx
      - Services.tsx
      - Resources.tsx
      - Team.tsx
      - News.tsx
      - NewsDetail.tsx
      - StudentDashboard.tsx
      - TeacherDashboard.tsx
      - ProtectedRoute.tsx
    /contexts
      - AuthContext.tsx
    - App.tsx
/db.json - JSON Server database
```

## Technology Stack

- React
- React Router DOM
- Tailwind CSS
- Recharts (for data visualization)
- Lucide React (for icons)
- JSON Server (mock API)
- Axios (HTTP client)

## API Endpoints

All API calls are made to `http://localhost:3001`. Make sure JSON Server is running before using the application.

## Notes

- The authentication system uses localStorage to persist user sessions
- All data is fetched from JSON Server, so you need to keep it running
- You can modify the `db.json` file to update the mock data
