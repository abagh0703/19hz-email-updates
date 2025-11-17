-- HardstyleEvents Database Schema
-- This script creates all necessary tables for the multi-location email subscription service

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (e.g., "hardstyle", "techno", etc.)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  event_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, location_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category_id ON subscriptions(category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_location_id ON subscriptions(location_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial category
INSERT INTO categories (name) 
VALUES ('hardstyle') 
ON CONFLICT (name) DO NOTHING;

-- Seed initial location (Bay Area)
INSERT INTO locations (name, event_url) 
VALUES ('San Francisco Bay Area / Northern California', 'https://19hz.info/eventlisting_BayArea.php')
ON CONFLICT (name) DO NOTHING;

-- Seed all locations from 19hz.info
INSERT INTO locations (name, event_url) VALUES
  ('Los Angeles / Southern California', 'https://19hz.info/eventlisting_LosAngeles.php'),
  ('Seattle', 'https://19hz.info/eventlisting_Seattle.php'),
  ('Atlanta', 'https://19hz.info/eventlisting_Atlanta.php'),
  ('Miami', 'https://19hz.info/eventlisting_Miami.php'),
  ('Washington, DC / Maryland / Virginia', 'https://19hz.info/eventlisting_DC.php'),
  ('Texas', 'https://19hz.info/eventlisting_Texas.php'),
  ('Philadelphia', 'https://19hz.info/eventlisting_Philadelphia.php'),
  ('Toronto', 'https://19hz.info/eventlisting_Toronto.php'),
  ('Iowa / Nebraska', 'https://19hz.info/eventlisting_Iowa.php'),
  ('Denver', 'https://19hz.info/eventlisting_Denver.php'),
  ('Chicago', 'https://19hz.info/eventlisting_Chicago.php'),
  ('Detroit', 'https://19hz.info/eventlisting_Detroit.php'),
  ('Massachusetts', 'https://19hz.info/eventlisting_Massachusetts.php'),
  ('Las Vegas', 'https://19hz.info/eventlisting_LasVegas.php'),
  ('Phoenix', 'https://19hz.info/eventlisting_Phoenix.php'),
  ('Portland / Oregon', 'https://19hz.info/eventlisting_Portland.php'),
  ('Vancouver / British Columbia', 'https://19hz.info/eventlisting_Vancouver.php')
ON CONFLICT (name) DO NOTHING;
