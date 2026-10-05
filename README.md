# BERRY Bakery

BERRY is a premium home bakery platform based near Cherpulassery, Palakkad, Kerala. This repository contains the initial monorepo foundation for the future storefront and operations platform.

## Project architecture

- `frontend`: React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Zustand, and Lucide React.
- `backend`: Node.js, Express, TypeScript, PostgreSQL driver, and Zod validation. Product/category reads and custom cake request persistence are available when a database is configured.
- `PostgreSQL / Supabase`: PostgreSQL-compatible migrations and seeds live in `backend/database`. The backend remains runnable without credentials.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## Backend setup

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:4000` by default. Its foundation check is available at `/api/health`.

## Environment variables

Copy `.env.example` to the repository-root `.env` for local development. Vite reads its public `VITE_*` values from that root file; Express reads server values from the same file. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the browser Auth client, and `SUPABASE_URL` plus `SUPABASE_ANON_KEY` for server-side bearer verification. These are the project URL and public anon/publishable key, not service-role credentials. Never put a service-role key in a `VITE_*` variable or commit real values. `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and any service-role key are server-only.

In Supabase Auth URL configuration, allow the app origin (locally `http://localhost:5173`) and the `/reset-password` redirect for each environment. Email confirmation and password recovery require the project's email delivery settings to be configured. Add these origins in the Supabase dashboard; do not put credentials in frontend source.

The customer order API also requires the backend `SUPABASE_URL` and `SUPABASE_ANON_KEY` to validate bearer sessions against Supabase Auth. Run `npm run db:migrate --prefix backend` after configuring `DATABASE_URL` to create the order tables and owner-scoped read policies. Order creation recalculates current available product prices server-side; delivery fees remain zero until delivery pricing is configured.

Razorpay payment requires backend-only `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The payment API returns only the public key ID and server-created amount/order ID needed by Checkout; signatures and captured amounts are verified server-side. Without these settings, orders can still be saved, but online payment endpoints return a configuration error and the order remains available for retry.

Migration 009 enables RLS and removes direct client table grants for catalog and custom-cake tables; the Express API remains the supported access path. Admin access is granted only by a database owner through `public.admin_users`; customer-editable Supabase Auth metadata cannot grant admin privileges. Provision an administrator as follows:

1. Create the owner account through the normal `/signup` flow and complete email verification if enabled.
2. In Supabase Authentication → Users (or the SQL editor), find that account's authenticated UUID. To look it up by email, run this query in the Supabase SQL editor and use the returned `id` locally; do not share it in chat.

```sql
SELECT id, email FROM auth.users WHERE email = lower('OWNER_EMAIL_HERE');
```

3. In the SQL editor, replace the UUID placeholder with that account's UUID and grant/activate its allowlist row:

```sql
INSERT INTO public.admin_users (user_id, is_active)
VALUES ('YOUR_AUTH_USER_UUID', TRUE)
ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE;
```

4. Sign in through `/login` and open `/admin`. The backend checks the Supabase session and active allowlist row on every admin API request.

Revoke access by setting `is_active = FALSE` for that UUID. Never add an admin role to customer-editable Auth metadata. Admin tables have RLS enabled and no direct client grants; all business operations go through server routes that validate the Supabase bearer token and active allowlist membership.

## Development commands

From the repository root:

```bash
npm install
npm run dev
npm run build
npm run lint
```

`npm run dev` starts both packages. `npm run build` compiles the frontend and backend. `npm run lint` runs ESLint in each package.

## Database setup

The schema is PostgreSQL-compatible and can be run against a local PostgreSQL instance or a Supabase database connection string.

```bash
cd backend
npm run db:migrate
npm run db:seed
```

Or run both with `npm run db:setup`. These commands require `DATABASE_URL` and fail clearly when it is missing. Migrations are numbered and tracked in `schema_migrations`; they do not drop or reset application tables. The seed is idempotent and uses the existing frontend product dataset.

Migrations create catalog, custom-cake request/reference metadata, customer orders/payment fields, the admin allowlist, coupons, reviews, and business settings. Customer credentials and sessions are handled by Supabase Auth. New custom-cake requests are linked to the authenticated user ID; legacy rows may remain unowned.

## Backend API

When a database is configured:

- `GET /api/products` supports `search`, `category`, `available`, `featured`, and `sort`.
- `GET /api/products/:slug` returns one product or a safe 404.
- `GET /api/categories` returns active categories in display order.
- `POST /api/custom-cake-requests`, `GET /api/custom-cake-requests`, and `GET /api/custom-cake-requests/:id` require a verified Supabase session; customer reads are scoped to the authenticated user. Admin request management is served by the protected `/api/admin/custom-cake-requests` endpoints.
- Migration 010 links new custom cake requests to `auth.users`. Legacy requests may retain a null owner. Reference image selection remains browser-local because secure Storage is not configured; image files are not included in request submissions.
- `POST /api/orders` creates an authenticated order after validating current product availability and calculating totals from database prices.
- `GET /api/orders` and `GET /api/orders/:id` return only orders belonging to the authenticated Supabase user.
- `POST /api/orders/:id/payment/create`, `/verify`, and `/failure` manage authenticated Razorpay attempts; only a matching captured payment with a valid server-checked signature changes payment status to `paid`.
- `/api/admin/*` requires an authenticated Supabase user and an active `admin_users` entry. It provides dashboard summaries, order/product/request/customer/coupon/review management, and business settings.

Without `DATABASE_URL`, `/api/health` remains healthy and reports `database: "unconfigured"`; database-backed endpoints return a safe 503. The frontend menu still uses its local typed dataset, and custom-cake reference images remain browser-local until a later storage phase.

## Folder structure

```text
berry-bakery/
├── frontend/
│   └── src/
│       ├── assets/       # Static frontend assets
│       ├── components/   # Shared UI components
│       ├── hooks/        # Reusable React hooks
│       ├── layouts/      # Page layouts
│       ├── lib/          # Library-level helpers
│       ├── pages/        # Route-level pages
│       ├── routes/       # Route definitions and constants
│       ├── services/     # API clients and service boundaries
│       ├── stores/       # Zustand stores
│       ├── types/        # Frontend types
│       └── utils/        # Frontend utilities
└── backend/
    ├── database/
    │   ├── migrations/  # Numbered PostgreSQL schema migrations
    │   └── seeds/       # Idempotent catalog seed data
    └── src/
        ├── config/       # Environment and application config
        ├── controllers/  # Request handlers
        ├── db/            # Optional PostgreSQL pool and health checks
        ├── middleware/   # Express middleware
        ├── repositories/  # Parameterized database queries
        ├── routes/       # HTTP route modules
        ├── services/     # Business services
        ├── types/        # Backend types
        ├── utils/        # Backend utilities
        └── validators/   # Request validation
```

Secure custom-cake image storage is not configured: selected images remain local previews and are not uploaded. Coupon application at checkout and dynamic public-site settings are not enabled yet.
