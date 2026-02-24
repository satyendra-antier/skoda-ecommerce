# ŠKODA Lifestyle — E-Commerce (Phase 1)

Full-stack e-commerce application for ŠKODA Lifestyle: product listing, cart, checkout, BillDesk payment integration, centralised inventory, Zoho CRM sync, and admin dashboard.

## Stack

- **Frontends:** Storefront (skoda-design, port 8080) and Admin panel (skoda-admin, port 8081) — both Vite + React, Tailwind CSS, ŠKODA design system (light/dark theme)
- **Backend:** NestJS 11, TypeORM, SQLite (dev)
- **Storage:** MinIO for product image uploads (admin)
- **Design:** Porsche-inspired (glass-surface, fluid typography, primary green)

## Repository structure

```
skoda/
├── apps/
│   ├── api/            # NestJS backend (port 4000)
│   ├── skoda-design/   # Storefront — Vite + React (port 8080)
│   └── skoda-admin/    # Admin panel — Vite + React (port 8081)
├── docker-compose.yml  # api, minio, web, admin
├── README.md
└── ...
```

## Quick start

### Option A: Docker Compose (recommended)

Run the **whole project at once** from the **skoda** folder:

```bash
./start.sh
```

Or manually:

```bash
docker compose up --build -d
```

Wait for the API healthcheck to pass (~20–30s), then:

- **Storefront:** http://localhost:8080  
- **Admin panel:** http://localhost:8081 (login: `admin` / `admin`)  
- **Backend API:** http://localhost:4000  
- **MinIO console:** http://localhost:9001 (minioadmin / minioadmin)

The API runs seed on first start so sample products are created. Data is stored in a Docker volume (`api-data`).

To stop and remove containers (keep data):

```bash
docker compose down
```

To reset the database as well:

```bash
docker compose down -v
```

### Option B: Local development

### 1. Backend (API)

```bash
cd apps/api
cp .env.example .env
npm install
npm run seed        # create sample products (optional)
npm run start:dev
```

API runs at **http://localhost:4000** (set `PORT=4000` or rely on default).

### 2. Storefront (skoda-design)

```bash
cd apps/skoda-design
# Set VITE_API_URL=http://localhost:4000 in .env if needed
npm install
npm run dev
```

Storefront runs at **http://localhost:8080**.

### 3. Admin panel (skoda-admin)

```bash
cd apps/skoda-admin
# Set VITE_API_URL=http://localhost:4000 in .env if needed
npm install
npm run dev
```

Admin runs at **http://localhost:8081**. Login: `admin` / `admin` (override via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in API `.env`).

## Admin data ingestion

- **Product/catalog data:** Use the **seed**. In Docker, the API runs the seed automatically on first start (idempotent: skips if products already exist). For local runs, execute once: `cd apps/api && npm run seed`. To add more products later, either run a custom seed script, use a future admin “Add product” UI, or insert via API/DB.
- **Admin login:** There is no admin user table. Credentials are read from environment variables only: `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the API. Set these in `apps/api/.env` or in `docker-compose.yml` for the `api` service. No seeding or CLI command is needed for admin login.
- **Summary:** Use **seeding for products** (automatic in Docker or `npm run seed`). Use **env vars for admin credentials**; no separate command or seed for admin users.

## Troubleshooting

- **“Fetch failed” / API not reachable:** The storefront or admin app cannot reach the backend.
  - **Docker:** Run all services: `docker compose up --build`. Ensure the API container is healthy (`docker compose ps`). Storefront and admin are built with `VITE_API_URL=http://localhost:4000`; from the browser they call the API on your machine, so ensure the API is up and port 4000 is reachable.
  - **Local:** Start the API first: `cd apps/api && npm run start:dev`. Then start the storefront: `cd apps/skoda-design && npm run dev` and/or the admin: `cd apps/skoda-admin && npm run dev`. Set `VITE_API_URL=http://localhost:4000` in each app’s `.env` if you use a different API URL.
- **No products on the shop:** Run the seed: in Docker it runs on first API start; locally run `cd apps/api && npm run seed` once.

## Environment variables

### API (`apps/api/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 4000) |
| `DB_PATH` | SQLite DB path (default `data/skoda.db`) |
| `FRONTEND_URL` | Frontend origin (for redirects) |
| `API_BASE_URL` | Public API base (for payment redirect when BillDesk not set) |
| `JWT_SECRET` | Secret for admin JWT |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login |
| `BILLDESK_*` | BillDesk credentials and URLs (optional) |
| `ZOHO_*` | Zoho CRM credentials and module (optional) |

### Storefront (`apps/skoda-design/.env`) and Admin (`apps/skoda-admin/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g. http://localhost:4000) |

## Features (SOW Phase 1)

- **Store:** Product listing (grid), product detail (gallery, specs, quantity, Add to Cart), cart, checkout (7 validated fields), order confirmation
- **Payments:** BillDesk init and callback; server-side hash; no card data stored; dev mode redirects to success without gateway
- **Inventory:** Centralised; deduct on payment success; oversell protection; out-of-stock disables Add to Cart
- **Zoho CRM:** Sync order on payment success; deduplication by Order ID; error logging; retry
- **Admin:** Login (JWT), dashboard (payment counts, product count, recent orders, revenue), orders (list + filter + CSV export, Zoho sync status, manual sync), products (CRUD, stock, featured/collection), settings (banner)

## Security

- Payment hash and credentials only on server (env vars)
- Admin routes protected by JWT
- No card or sensitive payment data stored

## Zoho CRM sync

- **When:** Sync runs automatically on payment success (BillDesk callback or dev success). No sync for pending or failed orders.
- **Deduplication:** Key is **Order_ID** in Zoho. If a record with the same Order ID already exists, it is **updated**; otherwise a new record is **created**. The order’s `zohoRecordId` is stored after the first successful create so future syncs use update.
- **Retries:** Up to 2 retries with backoff on failure; errors are logged.
- **Env vars:** `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ORDER_MODULE` (e.g. `Deals`), `ZOHO_DC` (e.g. `com`). If credentials are missing, sync is skipped with a warning.

## Documentation

- **[Platform guide (docs/PLATFORM.md)](docs/PLATFORM.md)** — How to use the platform, inputs, technical architecture, flows, file storage (MinIO), category vs collection, and admin form behaviour.
- API: no separate OpenAPI; endpoints under `GET/POST /products`, `/orders`, `/payment`, `/settings/banner`, `/admin/*`
- BillDesk and Zoho field mapping: adjust per client (see `.env.example` and Zoho service)

## Licence

Proprietary — ŠKODA AUTO India · Phase 1 SOW.
