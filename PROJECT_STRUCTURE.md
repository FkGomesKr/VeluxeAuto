# Project Structure

This document outlines the organization of the VeluxeAuto full-stack application.

## Overview

This is a Nuxt 3 full-stack application with:
- **Frontend**: Vue 3 components, pages, and composables
- **Backend**: Server-side API routes (read-only)
- **Database**: Supabase (PostgreSQL) - read-only
- **Storage**: AWS S3 - read-only image access via presigned URLs

## Directory Structure

```
VeluxeAuto/
├── assets/                 # Static assets (CSS, images)
│   └── css/
│       └── tailwind.css
├── components/             # Vue components
│   ├── global/            # Global components (Navbar, Footer)
│   ├── home/              # Home page components
│   └── stock/             # Stock-related components
├── composables/           # Vue composables (reusable logic)
│   └── useApi.ts          # API call composable (cars)
├── i18n/                  # Internationalization
│   └── lang/              # Language files
├── layouts/               # Layout components
│   └── default.vue
├── middleware/            # Route middleware
│   └── redirect-pt.global.ts
├── pages/                 # Page components (auto-routing)
│   ├── index.vue
│   ├── stock.vue
│   └── stockSingle/
│       └── [id].vue
├── plugins/               # Nuxt plugins (none currently)
├── public/                # Public static files
│   └── images/
├── server/                # Backend/server-side code
│   ├── api/               # API route handlers
│   │   ├── cars.get.ts   # GET /api/cars
│   │   └── cars/
│   │       └── [id].get.ts # GET /api/cars/:id
│   ├── schemas/           # Database schema definitions
│   │   └── cars.ts        # Cars table schema
│   ├── services/          # Business logic services
│   │   ├── database.service.ts # Generic DB operations
│   │   └── cars.service.ts     # Cars + image URLs
│   └── utils/             # Utility functions
│       ├── supabase.ts    # Supabase client
│       └── s3.ts          # S3 presigned URLs
├── .env.example           # Environment variables template
├── app.vue                # Root component
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies
└── tailwind.config.js     # Tailwind configuration
```

## Frontend Structure

### Components (`components/`)
- Organized by feature/domain (global, home, stock)
- Auto-imported by Nuxt 3
- Use PascalCase naming

### Pages (`pages/`)
- File-based routing
- Dynamic routes use brackets: `[id].vue`
- Auto-generates routes

### Composables (`composables/`)
- Reusable Vue composition functions
- Use `use` prefix: `useApi`, `useSBClient`
- `useApi()` - Simple API calls for cars data

### Plugins (`plugins/`)
- Run once at app initialization
- Good for setting up global services (Supabase client)

## Backend Structure

### API Routes (`server/api/`)
- File-based API routing
- File name determines HTTP method:
  - `.get.ts` → GET
- Dynamic routes: `[id].get.ts` → `/api/cars/:id`

**Available Endpoints:**
- `GET /api/cars` - Get all cars with images
- `GET /api/cars/:id` - Get single car with images

### Services (`server/services/`)
- Business logic layer
- `DatabaseService` - Generic read-only Supabase operations
- `CarsService` - Cars-specific logic with image URL generation

### Schemas (`server/schemas/`)
- Database schema definitions
- TypeScript types for type safety
- SQL for table creation

### Utilities (`server/utils/`)
- Helper functions
- `supabase.ts` - Supabase client creation (anon key)
- `s3.ts` - S3 presigned URL generation

## Data Flow

### Frontend → Backend
1. Component calls `useApi().getCars()` or `useApi().getCarById(id)`
2. Composable makes HTTP request to `/api/cars` or `/api/cars/:id`
3. Nuxt routes to `server/api/cars.get.ts` or `server/api/cars/[id].get.ts`
4. Handler uses `CarsService` for business logic
5. Service reads from Supabase and generates S3 presigned URLs
6. Response returned to frontend with car data + image URLs

### Example Flow: Get All Cars
```
Component
  → useApi().getCars()
    → GET /api/cars
      → server/api/cars.get.ts
        → CarsService.getAllCars()
          → DatabaseService.getAllItems('cars')
            → Supabase
          → generateCarImageUrls() for each car
            → AWS S3 presigned URLs
        → Return cars with images
      → Frontend receives cars array
```

## Image Naming Convention

Car images in S3 must follow this format:
```
car-{id}-{index}.jpg
```

Examples:
- `car-1-0.jpg` - First image of car ID 1
- `car-1-1.jpg` - Second image of car ID 1
- `car-2-0.jpg` - First image of car ID 2

The `picsNumber` field in the database determines how many images to fetch.

## Environment Variables

**All environment variables are server-side only and never exposed to the client.**

### Server-Side Only (Private)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name

**Security:** All database and storage access happens through server-side API routes. Credentials are never exposed to the browser, providing an additional layer of security even for read-only operations.

## Usage Example

### Frontend Component
```vue
<script setup lang="ts">
const { getCars, getCarById } = useApi()

// Get all cars
const cars = await getCars()

// Get single car
const car = await getCarById(1)
</script>

<template>
  <div v-for="car in cars" :key="car.id">
    <h2>{{ car.brand }} {{ car.model }}</h2>
    <img v-for="(image, index) in car.images" :key="index" :src="image" />
  </div>
</template>
```

## Best Practices

### Frontend
1. Use `useApi()` composable for all API calls
2. Handle loading and error states
3. Use TypeScript types from `server/schemas/cars.ts`

### Backend
1. Keep API routes thin - delegate to services
2. All operations are read-only
3. Presigned URLs expire after 7 days (configurable)
4. Handle errors gracefully with proper HTTP status codes

### Security
1. Never commit `.env` file
2. Use anon key for Supabase (read-only, no RLS needed)
3. Presigned URLs provide secure, time-limited access
4. No authentication needed (public showroom)

## Future: CloudFront Integration

When ready to use CloudFront:
1. Set up CloudFront distribution with S3 as origin
2. Update `generateCarImageUrls` in `server/utils/s3.ts` to use CloudFront URLs
3. CloudFront URLs are faster and don't require presigning
