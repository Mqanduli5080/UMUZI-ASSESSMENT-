-- SQL migration: create brews table

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS brews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beans text NOT NULL,
  method text NOT NULL,
  coffee_grams numeric NOT NULL,
  water_grams numeric NOT NULL,
  rating integer NOT NULL,
  tasting_notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
