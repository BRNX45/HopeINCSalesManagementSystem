# Sales Management System

A Sales Management System frontend built with React, Vite, and TypeScript. It demonstrates user authentication and role-based access using Supabase, admin and superadmin controls, user management, activity logging, and analytics reports (charts via Recharts). The project includes a mock data layer for local testing and utilities to persist role changes to a Supabase backend.

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

Notes

- This repository contains mock data for local development. Replace or integrate with a Supabase project for real-time persistence.
- Do not store or commit secrets or credentials in this repository.

License

MIT
