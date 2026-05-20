# Sales Management System

A Sales Management System frontend built with React, Vite, and TypeScript. It demonstrates user authentication and role-based access using Supabase, admin and superadmin controls, user management, activity logging, and analytics reports (charts via Recharts). The project includes a mock data layer for local testing and utilities to persist role changes to a Supabase backend.


Deployment - Vercel

Backend / Database - Supabase

Features

- Authentication with Supabase
- Role-based UI for User / Admin / Superadmin
- User management: activate/deactivate, make/revoke admin, block/unblock user activity
- Recent login activity log (mocked for local development)
- Analytics dashboard with charts and KPI placeholders

Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

Live Demo

The application is deployed at: **https://hope-inc-sales-management-system.vercel.app/**

Test Credentials

Use the following test accounts to explore the application:

**Admin Account:**
- Email: `testadmin@gmail.com`
- Password: `testadmin159`

**Features by Role:**
- **User**: View dashboard and reports
- **Admin**: Manage users, view login activity, block/unblock users
- **Superadmin**: Full access including make/revoke admin privileges

Notes

- This repository contains mock data for local development. Replace or integrate with a Supabase project for real-time persistence.
- Do not store or commit secrets or credentials in this repository.
- Test credentials are for demonstration purposes only.

License


