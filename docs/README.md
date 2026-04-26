# Solar Africa MVP Documentation

This repository contains a lightweight MVP for the Solar Africa platform.

## Structure

- `frontend/` - static landing pages and user screens
- `backend/` - simple Express server stub serving the frontend and a status API
- `docs/` - project documentation

## Frontend pages

- `index.html` - Home / landing page
- `packages.html` - Packages page with premium plan cards
- `team.html` - Referral and team page
- `profile.html` - User profile page
- `dashboard.html` - User dashboard page
- `admin.html` - Admin panel page

## Run locally

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

   If port 3000 is occupied, use a different port:
   ```bash
   set PORT=3001 && npm start
   ```

   To enable Supabase, copy `backend/.env.example` to `backend/.env` and fill in your Supabase project values.

3. Open `http://localhost:3000` (or the port you configured) in your browser.
