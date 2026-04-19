# VeluxeAuto -- Project Documentation

Full-stack car showroom website built with **Nuxt 3**, **Supabase** (PostgreSQL + Storage), and deployed on **Vercel**.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [Caching Strategy](#caching-strategy)
5. [Image System](#image-system)
6. [Contact System](#contact-system)
7. [Security](#security)
8. [Database](#database)
9. [Internationalization](#internationalization)
10. [Environment Variables](#environment-variables)
11. [Frontend Usage](#frontend-usage)
12. [Development](#development)

---

## Project Structure

```
VeluxeAuto/
├── assets/css/                  # Tailwind CSS
├── components/
│   ├── global/                  # Navbar, Footer, NotFound
│   ├── home/                    # HeroSection, Brand, Contact
│   └── stock/                   # Main (listing), SpecificPage, ContactSpecificPage
├── composables/
│   └── useApi.ts                # Frontend API composable (getCars, getCarById)
├── i18n/lang/                   # Language files (pt, en, es, fr, de, it, zh-CN)
├── layouts/
│   └── default.vue
├── middleware/
│   └── redirect-pt.global.ts
├── pages/
│   ├── index.vue                # Home page
│   ├── stock.vue                # Stock listing
│   └── stockSingle/[id].vue     # Car detail page
├── public/images/               # Static images (logo, etc.)
├── server/
│   ├── api/
│   │   ├── cars.get.ts          # GET  /api/cars
│   │   ├── cars/[id].get.ts     # GET  /api/cars/:id
│   │   ├── cache/clear.post.ts  # POST /api/cache/clear
│   │   ├── contact.post.ts      # POST /api/contact
│   │   └── image/car/[carId]/[index].get.ts  # GET /api/image/car/:carId/:index
│   ├── middleware/
│   │   └── cors.ts              # CORS for production domains
│   ├── plugins/
│   │   └── migrations.ts        # Dev-only table check on startup
│   ├── schemas/
│   │   ├── cars.ts              # TypeScript types (Car, CarWithImages)
│   │   ├── cars.sql             # SQL schema for cars table
│   │   ├── contact_messages.sql # SQL schema for contact_messages table
│   │   └── insert-cars.sql      # Sample seed data
│   ├── services/
│   │   ├── cars.service.ts      # Car data mapping + image URL generation
│   │   └── database.service.ts  # Generic Supabase table reads
│   └── utils/
│       ├── cache-bust.ts        # In-memory cache-bust flag
│       ├── rate-limit.ts        # In-memory rate limiter + IP extraction
│       ├── supabase.ts          # Supabase client (service role, singleton)
│       ├── supabase-storage.ts  # Image download helpers (full + thumb)
│       └── migrations.ts        # Cars table check / optional migration
├── nuxt.config.ts
├── tailwind.config.js
└── package.json
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Vue 3 SPA)                                    │
│  useApi().getCars() / getCarById(id)                    │
└────────────────────────┬────────────────────────────────┘
                         │ $fetch
┌────────────────────────▼────────────────────────────────┐
│  Vercel Edge (production only)                          │
│  Cache-Control: s-maxage → serves cached JSON/images    │
└────────────────────────┬────────────────────────────────┘
                         │ cache miss
┌────────────────────────▼────────────────────────────────┐
│  Nitro Server (Nuxt 3)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ CORS middle. │  │ Rate Limiter │  │ Cache-Bust    │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │ API Handlers  →  CarsService  →  DatabaseService │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ In-Memory Cache (5 min TTL, useful for dev)      │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│  Supabase        │         │  Supabase        │
│  PostgreSQL      │         │  Storage         │
│  (cars table)    │         │  (car-images)    │
└──────────────────┘         └──────────────────┘
```

**Data flow for car listing:**
1. Frontend calls `useApi().getCars()` → `$fetch('/api/cars')`
2. In production, Vercel edge may serve a cached response (up to 6h)
3. On cache miss, the Nitro handler checks the in-memory cache (5 min TTL)
4. On memory miss, `CarsService.getAllCars()` queries the `cars` table via `DatabaseService`
5. The service maps English DB fields to Portuguese frontend fields (`CarFrontend`)
6. Image URLs are generated as relative paths: `/api/image/car/{carId}/{index}`
7. Response is returned with appropriate `Cache-Control` headers

---

## API Endpoints

### `GET /api/cars`
Returns all cars with thumbnail image URLs for the stock listing.

- **Rate limit:** 60 requests per minute per IP
- **In-memory cache:** 5 minutes TTL (server-side, survives across requests)
- **Edge cache:** 6 hours `s-maxage` (production only)
- **Images:** First 3 images per car, with `?thumb=1` (thumbnails)

```json
{
  "success": true,
  "cars": [
    {
      "id": 1,
      "marca": "Audi",
      "modelo": "A6 3.0 TDi quattro",
      "combustivel": "Gasóleo",
      "anoReg": 2005,
      "preco": "12, 990",
      "transmissao": "Automático",
      "tipologia": "Hatchback",
      "lugares": 4,
      "kms": 330000,
      "imagens": ["/api/image/car/1/0?thumb=1", "/api/image/car/1/1?thumb=1", "/api/image/car/1/2?thumb=1"]
    }
  ]
}
```

### `GET /api/cars/:id`
Returns a single car with all full-size image URLs for the detail page.

- **Rate limit:** 120 requests per minute per IP
- **Edge cache:** 24 hours `s-maxage`, 5 minutes browser `max-age`
- **Images:** All images, full resolution (no `?thumb=1`)

### `GET /api/image/car/:carId/:index`
Streams a car image from Supabase Storage. Acts as a proxy so storage credentials are never exposed.

- **Rate limit:** 300 requests per minute per IP
- **Edge cache:** 30 days
- **Query params:** `?thumb=1` tries `car-{id}-{index}-thumb.jpg` first, falls back to full-size

### `POST /api/cache/clear`
Clears the in-memory cache and forces no-cache headers for 30 seconds. See [Cache Invalidation](#cache-invalidation).

### `POST /api/contact`
Submits a contact form. Inserts into `contact_messages` and sends emails via Resend (notification to owner + confirmation to user).

- **Rate limit:** 5 requests per hour per IP
- **Validation:** Name + message required, email or phone required, max 500 chars
- **Emails:** Localized confirmation in 7 languages

---

## Caching Strategy

The application uses a **two-layer caching** approach, plus a manual cache-clear mechanism.

### Layer 1: In-Memory Server Cache (Dev + Prod)

Located in `server/api/cars.get.ts`. The `/api/cars` handler stores the full car list in a module-level variable.

| Property | Value |
|----------|-------|
| **TTL** | **5 minutes** |
| **Scope** | Single server process (shared across all requests) |
| **Purpose** | Avoids redundant Supabase queries during rapid page loads |
| **Cleared by** | TTL expiry, cache-bust trigger, or server restart |

This cache is useful both in development (where there is no edge cache) and in production (as a fallback when edge cache misses).

### Layer 2: Vercel Edge Cache (Production Only)

Configured via `Cache-Control` response headers set by each API handler, and reinforced by Nitro `routeRules` in `nuxt.config.ts`.

| Resource | `s-maxage` | `stale-while-revalidate` | Notes |
|----------|-----------|-------------------------|-------|
| `GET /api/cars` | **6 hours** (21,600s) | 6 hours | Stock list JSON |
| `GET /api/cars/:id` | **24 hours** (86,400s) | 24 hours | Single car JSON |
| `GET /api/image/car/**` | **30 days** (2,592,000s) | 30 days | Image binary proxy |
| `/_nuxt/**` | **1 year** | immutable | Build assets (content-hashed) |
| `/images/**` | **1 year** | 1 year | Static images (logo, etc.) |

In development (localhost), these `s-maxage` headers have no effect because there is no edge/CDN layer. The in-memory cache is the only caching layer active locally.

### Cache Invalidation

When you update inventory in Supabase (add/remove/edit a car), cached responses become stale. To force fresh data:

**Endpoint:** `POST /api/cache/clear`

**Authentication:** Requires the `x-cache-key` header matching the `CACHE_CLEAR_KEY` environment variable.

**Postman setup:**
- **Method:** `POST`
- **URL:** `https://veluxeauto.com/api/cache/clear` (or `http://localhost:3000/api/cache/clear` for local)
- **Header:** `x-cache-key: <your CACHE_CLEAR_KEY value>`

**What happens when you call it:**

1. `triggerCacheBust()` sets an in-memory flag for **30 seconds**
2. The in-memory car cache (`memCache`) is immediately cleared
3. During the 30-second window, all car endpoints respond with `Cache-Control: no-cache, no-store, must-revalidate`
4. This tells Vercel's edge to discard the cached version and fetch fresh data from the origin
5. After 30 seconds, normal caching headers resume and the edge re-caches the fresh response

**Testing locally:**
1. Load the stock page -- cars are fetched and cached in memory for 5 minutes
2. Update a car in Supabase
3. Reload the page -- you still see stale data (served from memory cache)
4. Call `POST /api/cache/clear` with the `x-cache-key` header
5. Reload the page -- you now see fresh data from the database
6. Subsequent requests within the next 5 minutes use the refreshed memory cache

### Summary Table

| Environment | In-Memory Cache | Edge Cache | Cache-Clear Effect |
|-------------|----------------|------------|-------------------|
| **Development** | 5 min | None (no CDN) | Clears memory cache, forces DB read |
| **Production** | 5 min | 6h (list) / 24h (detail) / 30d (images) | Clears memory + forces edge purge for 30s |

---

## Image System

Car images are stored in **Supabase Storage** in a bucket configured by `SUPABASE_STORAGE_BUCKET` (default: `car-images`).

### Naming Convention

```
Full size:  car-{id}-{index}.jpg      (e.g. car-1-0.jpg, car-1-1.jpg)
Thumbnail:  car-{id}-{index}-thumb.jpg (e.g. car-1-0-thumb.jpg)
```

The `pics_number` column in the `cars` table determines how many images exist for each car.

### Image Proxy

Images are never served directly from Supabase to the browser. Instead, they flow through the server image proxy at `/api/image/car/:carId/:index`:

1. The server downloads the image from Supabase Storage using the service role key
2. Streams the binary response to the client with a 30-day `Cache-Control` header
3. Vercel's edge caches the response, so subsequent requests don't hit Supabase

**Stock list** requests use `?thumb=1`, which tries the `-thumb.jpg` variant first and falls back to the full-size image if no thumbnail exists.

**Detail page** requests use the full-size images (no `?thumb` param), and all images are returned (not limited to 3).

---

## Contact System

`POST /api/contact` handles the contact form submission:

1. **Validates** input (name, message required; email or phone required; 500 char limit)
2. **Rate-limits** to 5 submissions per hour per IP
3. **Inserts** the message into the `contact_messages` table in Supabase
4. **Sends two emails** via Resend (in parallel with `Promise.allSettled`):
   - Notification to `veluxeauto@gmail.com` with the full message details
   - Localized confirmation to the user (if email was provided)
5. Returns success even if one operation fails (DB insert or email); only fails if both fail

---

## Security

- **Server-side only credentials:** All Supabase and Resend keys are in `runtimeConfig` (never exposed to the client)
- **Service role key:** Used for full DB + Storage access; no anon key is used
- **CORS:** Production allows `veluxeauto.com`, `www.veluxeauto.com`, and Vercel preview URLs. Dev mode allows all origins
- **Rate limiting:** In-memory per-IP rate limits on all endpoints (cars: 60/min, car detail: 120/min, images: 300/min, contact: 5/hour)
- **Cache-clear auth:** Protected by `x-cache-key` header matching `CACHE_CLEAR_KEY`
- **Image proxy:** Storage credentials never reach the browser; images are streamed through the server

---

## Database

### Supabase PostgreSQL

Two tables, both managed via SQL scripts in `server/schemas/`:

**`cars`** -- Vehicle inventory

| Column | Type | Notes |
|--------|------|-------|
| `id` | `SERIAL` | Primary key |
| `brand` | `VARCHAR(255)` | e.g. "Audi", "BMW", "Mini" |
| `model` | `VARCHAR(255)` | e.g. "A6 3.0 TDi quattro", "Cooper" |
| `year` | `INTEGER` | Registration year |
| `price` | `DECIMAL(10,2)` | Price in EUR |
| `mileage` | `INTEGER` | Kilometers |
| `fuel_type` | `VARCHAR(50)` | "Gasóleo", "Elétrico", etc. |
| `transmission` | `VARCHAR(50)` | "Automático", "Manual de 6 velocidades" |
| `color`, `power`, `displacement`, `condition`, `seats`, `doors`, `body_type`, `consumption` | various | Optional car attributes |
| `pics_number` | `INTEGER` | Number of images in storage |

**`contact_messages`** -- Contact form submissions

| Column | Type |
|--------|------|
| `id` | `SERIAL` |
| `name` | `VARCHAR(255)` |
| `email` | `VARCHAR(255)` (nullable) |
| `phone` | `VARCHAR(50)` (nullable) |
| `message` | `VARCHAR(500)` |
| `created_at` | `TIMESTAMPTZ` |

### Field Mapping

The `CarsService` maps English DB fields to Portuguese frontend fields:

| DB Field | Frontend Field |
|----------|---------------|
| `brand` | `marca` |
| `model` | `modelo` |
| `fuel_type` | `combustivel` |
| `year` | `anoReg` |
| `price` | `preco` (formatted as "12, 990") |
| `transmission` | `transmissao` |
| `body_type` | `tipologia` |
| `seats` | `lugares` |
| `mileage` | `kms` |

### Dev Startup Check

On development startup, the Nitro plugin `server/plugins/migrations.ts` checks that the `cars` table exists (with a 5-second timeout) and logs a warning if it's missing. It does not block server startup.

---

## Internationalization

7 languages supported via `@nuxtjs/i18n`:

| Code | Language |
|------|----------|
| `pt` | Português (default) |
| `en` | English |
| `es` | Español |
| `fr` | Français |
| `de` | Deutsch |
| `it` | Italiano |
| `zh-CN` | 中文 |

URL strategy: `prefix_except_default` (Portuguese has no prefix, others get `/en/`, `/es/`, etc.)

---

## Environment Variables

All variables are **server-side only** (defined in `runtimeConfig`, never in `public`).

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (full access, bypasses RLS) |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name (default: `car-images`) |
| `RESEND_API_KEY` | Yes | Resend API key for email sending |
| `CACHE_CLEAR_KEY` | Yes | Secret key for the cache-clear endpoint |

---

## Frontend Usage

### Fetching Cars

```vue
<script setup>
const { getCars, getCarById } = useApi()

const cars = await getCars()
const car = await getCarById(1)
</script>
```

### Filtering

Both the home page hero and stock page derive filter options dynamically from the fetched car data:

- **Brands** (`marcas`): unique `marca` values from all loaded cars, sorted alphabetically
- **Models** (`modelos`): unique `modelo` values, filtered by the currently selected brand

When the user selects a brand, the model dropdown updates to show only models for that brand, and the model selection resets.

On the home page, selecting filters and clicking "Search" navigates to `/stock` with query parameters. The stock page reads these query params and applies them as initial filter values.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:3000`. The in-memory cache (5 min) is the only caching layer active locally -- there is no edge cache in development.
