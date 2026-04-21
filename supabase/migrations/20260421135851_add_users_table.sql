
/*
  # Add Users Profile Table for ReflectScan

  ## Overview
  Creates a public users profile table to store user metadata linked to Supabase auth.
  This table stores additional user information like role, organization, and contact details.

  ## New Tables

  ### users
  - id (uuid, references auth.users)
  - email (text)
  - full_name (text)
  - mobile_number (text)
  - employee_id (text, unique)
  - organization (text)
  - role (text) - inspector, engineer, admin, contractor
  - created_at (timestamp)

  ## Security
  - RLS enabled for public read (demo purposes)
  - All users can view profiles

  ## Notes
  - This table is separate from auth.users and stores app-specific metadata
  - Unauthenticated users can view profiles for demo
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  mobile_number text,
  employee_id text UNIQUE NOT NULL,
  organization text DEFAULT 'NHAI',
  role text NOT NULL CHECK (role IN ('inspector', 'engineer', 'admin', 'contractor')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
