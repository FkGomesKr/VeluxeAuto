# Server Directory Structure

This directory contains all backend/server-side code for the Nuxt 3 application.

## Overview

This is a **read-only** backend for a car showroom website:
- **Database**: Supabase (PostgreSQL) - read-only operations
- **Storage**: AWS S3 - read-only image access via presigned URLs
- **No authentication**: Public showroom website

## Directory Structure

```
server/
├── api/                    # API route handlers
│   ├── cars.get.ts        # GET /api/cars - Get all cars
│   └── cars/
│       └── [id].get.ts     # GET /api/cars/:id - Get car by ID
├── schemas/               # Database schema definitions
│   └── cars.ts           # Cars table schema and TypeScript types
├── services/              # Business logic services
│   ├── database.service.ts # Generic read-only database operations
│   └── cars.service.ts    # Cars-specific service with image URL generation
└── utils/                 # Utility functions
    ├── supabase.ts        # Supabase client creation
    └── s3.ts              # AWS S3 presigned URL generation
```

## API Routes

### GET /api/cars
Returns all cars with their image URLs.

**Query Parameters:**
- `expiresIn` (optional): URL expiration time in seconds (default: 604800 = 7 days)

**Response:**
```json
{
  "success": true,
  "cars": [
    {
      "id": 1,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2023,
      "price": 25000,
      "picsNumber": 5,
      "images": ["https://presigned-url-1", "https://presigned-url-2", ...]
    }
  ]
}
```

### GET /api/cars/:id
Returns a single car by ID with its image URLs.

**Query Parameters:**
- `expiresIn` (optional): URL expiration time in seconds (default: 604800 = 7 days)

**Response:**
```json
{
  "success": true,
  "car": {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2023,
    "price": 25000,
    "picsNumber": 5,
    "images": ["https://presigned-url-1", "https://presigned-url-2", ...]
  }
}
```

## Database Schema

The `cars` table schema is defined in `server/schemas/cars.ts`. Use this SQL to create the table in Supabase:

```sql
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  color VARCHAR(100),
  description TEXT,
  picsNumber INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_year ON cars(year);
```

## Image Naming Convention

Car images in S3 must follow this naming format:
```
car-{id}-{index}.jpg
```

Examples:
- `car-1-0.jpg` (first image of car with id=1)
- `car-1-1.jpg` (second image of car with id=1)
- `car-2-0.jpg` (first image of car with id=2)

The `picsNumber` field in the database determines how many images exist for each car.

## Services

### CarsService

Handles car data retrieval and automatically generates presigned URLs for car images.

**Usage:**
```typescript
import { CarsService } from '~/server/services/cars.service'

const carsService = new CarsService()
const cars = await carsService.getAllCars() // 7 days expiration default
const car = await carsService.getCarById(1, 3600) // 1 hour expiration
```

### DatabaseService

Generic read-only database operations.

**Usage:**
```typescript
import { DatabaseService } from '~/server/services/database.service'

const dbService = new DatabaseService()
const items = await dbService.getAllItems('cars')
const item = await dbService.getItemById('cars', 1)
```

## Environment Variables

**All environment variables are server-side only and never exposed to the client.**

Required environment variables (see `.env.example`):

- `SUPABASE_URL` - Your Supabase project URL (server-side only)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (server-side only)
- `AWS_ACCESS_KEY_ID` - AWS access key ID (server-side only)
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key (server-side only)
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name

**Security Note:** All database access happens through server-side API routes. Credentials are never exposed to the browser, providing an additional layer of security even for read-only operations.

## Frontend Usage

Use the `useApi` composable in your Vue components:

```vue
<script setup>
const { getCars, getCarById } = useApi()

// Get all cars
const cars = await getCars()

// Get single car
const car = await getCarById(1)
</script>
```

## Future: CloudFront Integration

When ready to use CloudFront with S3 as origin:
1. Set up CloudFront distribution pointing to your S3 bucket
2. Update `generateCarImageUrls` in `server/utils/s3.ts` to use CloudFront URLs instead of presigned URLs
3. CloudFront URLs will be faster and don't require presigning
