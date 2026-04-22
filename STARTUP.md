# Quick Start Guide

## Running the Application

You need to run TWO terminals simultaneously:

### Terminal 1 - JSON Server (Backend API)
```bash
pnpm run server
```
or
```bash
npx json-server --watch db.json --port 3001
```

This starts the mock backend API on http://localhost:3001

### Terminal 2 - Development Server (Frontend)
```bash
pnpm run dev
```

This starts the React application

## Access the Application

Once both servers are running:

1. Open your browser and go to the URL shown in Terminal 2 (usually http://localhost:5173)
2. You'll see the home page with navigation to:
   - Home
   - About
   - Services
   - Resources
   - Team
   - News

## Testing Authentication

### Quick Login:
Click "Login" button and use:
- Email: `student@edu.com`
- Password: `student123`

### Register New Account:
1. Click "Register" button
2. Fill in your details
3. You'll be automatically logged in and redirected to the portal

### Access Dashboards:
After logging in:
1. You'll see the Portal page
2. Click on "Students" to view Student Dashboard
3. Click on "Teachers" to view Teacher Dashboard

## Important Notes

⚠️ **Make sure JSON Server is running first** before trying to use the application, otherwise:
- Login/Register won't work
- Dashboards will show loading indefinitely
- Resources, Team, and News pages won't display data

✅ **If you see errors**, check that:
1. Port 3001 is not being used by another application
2. The `db.json` file exists in the root directory
3. Both terminals are running without errors

## Modifying Data

You can edit the `db.json` file to:
- Add new students, teachers, news articles
- Modify existing data
- Add new users for authentication

The JSON Server will automatically reload when you save changes to `db.json`.
