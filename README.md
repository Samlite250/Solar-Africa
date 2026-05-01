# Solar Africa MVP

A premium, production-ready platform prototype for Solar Africa with beautiful design, mobile-first responsive layout, and database integration.

## Files Overview

- `solarafrica.sql` - Complete database schema for Supabase setup
- `backend/` - Express.js server with API endpoints
- `frontend/` - Static HTML/CSS/JS pages with responsive design
- `docs/` - Additional documentation and setup guides

## What is included

- `frontend/`
  - Landing page with hero, packages, testimonials, FAQ, footer
  - Dashboard with wallet balance, active package, recent activity
  - Packages page with attractive package cards
  - Team/Referrals page with referral metrics
  - Profile page with account details and activity history
  - Admin panel with stats tables for users/packages/deposits
  - Responsive mobile-first design with bottom navigation
  - Clean, bright style with premium solar branding (sky blue/green/white)
- `backend/`
  - Express.js server with comprehensive API endpoints
  - Supabase database integration with fallback to mock data
  - API routes: `/api/packages`, `/api/dashboard`, `/api/team`, `/api/profile`, `/api/admin/stats`
  - Environment-based configuration
- `docs/`
  - Complete Supabase database schema with RLS policies
  - Project documentation and setup instructions

## Features

- ✅ Beautiful, light, clean design
- ✅ Mobile-first responsive layout
- ✅ Premium package cards with trust elements
- ✅ Fast loading with minimal features
- ✅ Database-ready with Supabase integration
- ✅ API-driven data hydration
- ✅ Admin panel with deposits/packages/users stats
- ✅ Bottom navigation for mobile users

## Setup Checklist

- [x] Deploy Supabase database and configure environment variables (solarafrica.sql created with complete schema)

## Run the MVP

```bash
cd backend
npm install
npm start
```

If port 3000 is occupied, set a different port:

**Windows PowerShell:**
```bash
cd backend
$env:PORT=3001; npm start
```

**Windows Command Prompt:**
```bash
cd backend
set PORT=3001 && npm start
```

## Supabase Setup (Optional)

To enable live database functionality:

1. Create a Supabase project at https://supabase.com
2. Copy `backend/.env.example` to `backend/.env`
3. Fill in your Supabase project URL and anon key
4. Run the SQL schema from `solarafrica.sql` in your Supabase SQL editor
5. The app will automatically use live data when Supabase is configured

## Vercel Deployment

This app is ready for Vercel hosting using the Express backend and static frontend assets.

1. Install the Vercel CLI or connect the repository in the Vercel dashboard.
2. Ensure `backend/.env` is configured with `SUPABASE_URL` and `SUPABASE_KEY` in Vercel environment variables.
3. Deploy from the repository root.

The `vercel.json` file routes all requests to the Express backend at `backend/server.js`.

## API Endpoints

- `GET /api/status` - Platform status and Supabase connection
- `GET /api/packages` - Available solar packages
- `GET /api/dashboard` - User dashboard data
- `GET /api/team` - Referral and team data
- `GET /api/profile` - User profile information
- `GET /api/admin/stats` - Admin statistics (users, packages, deposits)

## Pages

- `/` or `/index.php` - Landing page
- `/dashboard.php` - User dashboard
- `/packages.php` - Package selection
- `/team.php` - Referrals and team
- `/profile.php` - User profile
- `/admin.php` - Admin panel

Open `http://localhost:3000` (or your configured port) to view the platform.
