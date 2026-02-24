# ŠKODA Lifestyle E-Commerce — Platform Guide

This document describes how to use the platform, what inputs are used, how data is managed, technical architecture, flows, and file storage.

---

## 1. Overview

The platform has three main parts:

| Part | URL (Docker) | Purpose |
|------|--------------|---------|
| **Storefront** | http://localhost:8080 | Public shop: browse products, cart, checkout, orders |
| **Admin panel** | http://localhost:8081 | Back-office: products, orders, settings (login: admin / admin) |
| **API** | http://localhost:4000 | Backend: REST API, auth, payments, file storage |

Additional services:

- **MinIO** (http://localhost:9001): Object storage for product and banner images (console: minioadmin / minioadmin).

---

## 2. How to Use the Platform

### 2.1 Running the full stack

From the project root (`skoda/`):

```bash
./start.sh
# or: docker compose up --build -d
```

Wait ~20–30 seconds for the API to be healthy, then open the storefront and admin URLs above.

### 2.2 Storefront (customers)

- **Home**: Hero carousel (banner images from Admin → Settings), featured content.
- **Shop**: Product grid with category filter (from Settings → Shop categories), search, sort. Click a product for detail; add to cart / wishlist.
- **Cart**: Review items, change quantity, go to checkout.
- **Checkout**: Customer details (name, email, phone, address, etc.); place order; redirect to payment (BillDesk) or dev success.
- **Wishlist**: Saved product IDs (client-side); persists across refresh.

### 2.3 Admin panel

- **Login**: Use credentials set in API env (`ADMIN_USERNAME` / `ADMIN_PASSWORD`; default admin / admin).
- **Dashboard**: Payment counts, product count, revenue, recent orders.
- **Products**: List, add, edit, delete; set category (dropdown from Settings), badge, collection, featured, price, stock, images (upload via MinIO).
- **Orders**: List, filter by payment/fulfilment, CSV export, Zoho sync status, manual sync.
- **Settings**:
  - **Banner**: Upload images for the storefront hero carousel (multiple; order = slide order).
  - **Shop categories**: Add/remove category names; these drive the storefront Shop filter and the product category dropdown in Add/Edit product.

---

## 3. Inputs and Data We Manage

### 3.1 Product (catalog)

| Field | Required | Description | Where it appears |
|-------|----------|-------------|------------------|
| **SKU** | Yes | Unique product code (e.g. ACC-001) | Admin list, API |
| **Name** | Yes | Product title | Storefront (card, detail), admin |
| **Short description** | No | Brief line | API / future use |
| **Description** | No | Full description | Product detail page |
| **Category** | No | One of the **Shop categories** from Settings | Shop filter, product card, detail; admin dropdown |
| **Badge** | No | Label (e.g. "Best Seller", "New") | Product card and detail (chip) |
| **Collection** | No | Thematic group (e.g. "Summer 2025") | Product card (· Collection) and detail ("Collection: …") |
| **Featured** | No | Boolean; can drive “featured” sections | API / future use |
| **Price** | Yes | Unit price (numeric) | Everywhere price is shown |
| **Stock quantity** | Yes | Available quantity | Admin; storefront (availability, max qty) |
| **Image URLs** | No | List of image URLs (from admin upload) | Gallery on detail; card uses first image |

**Category** must be one of the categories defined in **Settings → Shop categories**. Admin Add/Edit product use a **dropdown** for category (no free text). If no categories exist, add them in Settings first.

**Collection** is optional. It does not affect filtering or routing; it is for **grouping and display** only (e.g. campaigns or themed ranges). On the frontend it is shown as “· CollectionName” on the product card and “Collection: CollectionName” on the product detail page.

### 3.2 Order / checkout

Customer inputs at checkout: name, email, phone, address (line1, line2, city, state, pincode). Stored with order and optional Zoho sync.

### 3.3 Settings

- **Banner**: List of image URLs (uploaded in Settings; stored in `site_settings`).
- **Shop categories**: Ordered list of category names (e.g. Accessories, Interior, Exterior). Stored in `site_settings`; used by storefront Shop filter and admin product category dropdown.

---

## 4. Technical Architecture

### 4.1 High-level

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Storefront    │     │   Admin panel    │     │   MinIO         │
│   (Vite+React)  │     │   (Vite+React)   │     │   (S3-compat)    │
│   :8080         │     │   :8081          │     │   :9000 / :9001  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                        │
         │  REST (public)         │  REST + JWT            │  API uploads
         │  (products, orders,   │  (/admin/*)             │  objects
         │   settings, payment)   │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API (NestJS)  │
                         │   :4000         │
                         │   SQLite +      │
                         │   TypeORM       │
                         └─────────────────┘
```

- **Storefront** and **Admin** are separate React apps; both talk to the same API.
- **API** is the single source of truth: products, orders, settings, auth, payment initiation, Zoho sync.
- **MinIO** is used only for file storage; the API generates and returns public image URLs (e.g. `MINIO_PUBLIC_URL` + object key).

### 4.2 Backend (API) layout

- **Products**: CRUD, list with status filter; category/collection are plain fields.
- **Orders**: Create order, list, filter; order items reference product ID and quantity.
- **Payment**: Init payment (BillDesk or dev), callback, success/failure handling; inventory deduction and Zoho sync on success.
- **Admin**: Login (JWT), dashboard, product CRUD, upload (multipart → MinIO), order list/export/sync, settings (banner, categories).
- **Settings**: Public `GET /settings/categories` and `GET /settings/banner`; admin GET/PUT for banner and categories.
- **Storage**: MinIO client; upload returns public URL; bucket created on startup if missing.

Database: SQLite (default `data/skoda.db` or `DB_PATH`). Entities: Product, Order, OrderItem, SiteSetting.

### 4.3 Frontend apps

- **skoda-design** (storefront): React, React Router, TanStack Query, Tailwind; cart/wishlist in localStorage; calls public API only.
- **skoda-admin**: React, React Router, TanStack Query, Tailwind; JWT in localStorage; calls `/admin/*` with `Authorization: Bearer <token>`.

---

## 5. Technical Flows

### 5.1 Product list and category filter

1. Storefront loads categories: `GET /settings/categories` → `{ categories: string[] }`.
2. Storefront loads products: `GET /products` → list of products (each has `category`, `collection`, etc.).
3. User selects a category (or “All”): filtering is done client-side; only products with that `category` are shown.

### 5.2 Admin: category dropdown and add/edit product

1. Admin Settings → Shop categories: add/remove category names; saved via `PUT /admin/settings/categories`.
2. Admin Products → Add product / Edit product: categories loaded with `GET /admin/settings/categories` and shown in a **dropdown**. User picks one (or “—” for none); value is stored in `product.category`.
3. Create product: `POST /admin/products` with body including `category`, `collection`, etc.
4. Update product: `PATCH /admin/products/:id` with same fields.

### 5.3 Image upload (admin)

1. Admin selects file(s) in product edit or Settings (banner).
2. Frontend sends `POST /admin/upload` with `multipart/form-data`, field name `files`, and `Authorization: Bearer <token>`.
3. API uses Multer + StorageService: each file is uploaded to MinIO under `products/<timestamp>-<random>.<ext>` (or equivalent); bucket from `MINIO_BUCKET`.
4. API returns `{ urls: string[] }` where each URL is `MINIO_PUBLIC_URL + "/" + objectKey` (e.g. `http://localhost:9000/skoda-products/products/xxx.jpg`).
5. Admin form saves those URLs into product `imageUrls` or banner settings.

### 5.4 Checkout and payment

1. Storefront: cart (product IDs + quantities) and product list from API; user fills checkout form and submits.
2. `POST /orders` creates order; `POST /payment/init` returns payment URL (or dev success).
3. User completes payment (BillDesk or dev); callback hits `POST /payment/callback` (or success flow).
4. API updates order status, deducts inventory, optionally syncs to Zoho.

---

## 6. File Storage (MinIO)

### 6.1 Role of MinIO

- **Product images**: Uploaded from admin (product edit); URLs stored in `product.imageUrls`.
- **Banner images**: Uploaded from admin Settings; URLs stored in site settings and used for the storefront hero carousel.

All uploads go through the API; the storefront and admin never talk to MinIO directly. The API returns **public URLs** so the browser can load images from MinIO (or a CDN if you replace `MINIO_PUBLIC_URL`).

### 6.2 Configuration (API env)

| Variable | Description |
|----------|-------------|
| `MINIO_ENDPOINT` | Hostname of MinIO (e.g. `minio` in Docker, `localhost` locally) |
| `MINIO_PORT` | MinIO API port (default 9000) |
| `MINIO_USE_SSL` | `true` if using HTTPS |
| `MINIO_ACCESS_KEY` | Access key |
| `MINIO_SECRET_KEY` | Secret key |
| `MINIO_BUCKET` | Bucket name (default `skoda-products`) |
| `MINIO_PUBLIC_URL` | Base URL for returned image links (e.g. `http://localhost:9000/skoda-products`) |

If `MINIO_PUBLIC_URL` is not set, the API builds it from endpoint and port. For Docker, set `MINIO_PUBLIC_URL` to a URL reachable by the browser (e.g. `http://localhost:9000/skoda-products`).

### 6.3 Object layout

- Product images: `products/<timestamp>-<random>.<ext>` inside the configured bucket.
- Banner images: same bucket/path style; only the stored URL list differs (banner vs product).

Bucket is created on API startup if it does not exist.

---

## 7. Collection: Impact and Frontend Visibility

**What “Collection” is**

- A **product-level** optional string (e.g. "Summer 2025", "Limited Edition").
- Used for **thematic grouping** only; it does not drive routing or filtering in the current implementation.

**How it’s used**

- **Admin**: Add/Edit product have a “Collection” field (optional). Stored in `product.collection`.
- **Storefront**:
  - **Product card**: If `product.collection` is set, it is shown next to the category as “· CollectionName”.
  - **Product detail**: If set, it is shown as “Collection: CollectionName” under the category.

**Possible future use**

- Filter by collection on the Shop page.
- Dedicated “Collections” section or landing pages.
- Promotional blocks by collection.

---

## 8. Summary Checklist

- **Categories**: Defined in Admin → Settings → Shop categories; used in Storefront Shop filter and in Admin product **category dropdown** (Add/Edit product).
- **Collection**: Optional product field; displayed on card and detail; no filter yet.
- **Form spacing**: Admin Add/Edit product use `space-y-2` and `mt-1` for label/input spacing.
- **Images**: Upload via Admin (product or banner); API uploads to MinIO and returns public URLs; no direct MinIO access from frontends.
- **One command run**: `./start.sh` or `docker compose up --build -d`; storefront 8080, admin 8081, API 4000.

For quick start and env vars, see the main [README](../README.md).
