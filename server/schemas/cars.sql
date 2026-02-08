-- Cars table schema
-- This SQL can be run manually in Supabase SQL Editor
-- Or it will be checked automatically on server startup

CREATE TABLE IF NOT EXISTS cars (
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
  power INTEGER,
  displacement INTEGER,
  condition VARCHAR(100),
  seats INTEGER,
  doors INTEGER,
  body_type VARCHAR(100),
  consumption DECIMAL(5, 2),
  pics_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
