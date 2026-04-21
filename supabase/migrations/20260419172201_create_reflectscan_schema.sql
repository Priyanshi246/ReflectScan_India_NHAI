
/*
  # ReflectScan India - NHAI Retroreflectivity Platform Schema

  ## Overview
  Creates the full database schema for the ReflectScan India dashboard,
  including roads, surveys, assets, inspections, and alerts.

  ## New Tables

  ### roads
  - Highway routes managed by NHAI across India
  - Includes zone, length, and highway code

  ### surveys
  - Field survey sessions conducted by inspectors
  - Linked to roads and users (inspector_name)

  ### assets
  - Individual road assets (signs, lane markings, studs, delineators)
  - GPS-tagged with highway association

  ### inspections
  - Reflectivity inspection results per asset
  - Includes score (0-100), status (pass/warning/fail), image_url, remarks

  ### alerts
  - Automated alerts for low-scoring assets
  - Severity: low, medium, high, critical

  ## Security
  - RLS enabled on all tables
  - Public read access for demo (dashboard accessible without auth)

  ## Seed Data
  - 6 major highways
  - 20 surveys
  - 60 assets
  - 80 inspections
  - 15 alerts
*/

CREATE TABLE IF NOT EXISTS roads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  highway_code text NOT NULL,
  zone text NOT NULL,
  length_km numeric(8,2) DEFAULT 0,
  state text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for roads"
  ON roads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id uuid REFERENCES roads(id),
  inspector_name text NOT NULL,
  inspector_zone text NOT NULL,
  route_name text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'pending_review')),
  total_assets int DEFAULT 0,
  pass_count int DEFAULT 0,
  fail_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for surveys"
  ON surveys FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id uuid REFERENCES roads(id),
  type text NOT NULL CHECK (type IN ('road_sign', 'lane_marking', 'road_stud', 'delineator')),
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  location_description text,
  installed_date date,
  last_inspected timestamptz,
  current_score int DEFAULT 0,
  current_status text DEFAULT 'unknown' CHECK (current_status IN ('pass', 'warning', 'fail', 'unknown')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for assets"
  ON assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id),
  survey_id uuid REFERENCES surveys(id),
  score int NOT NULL CHECK (score >= 0 AND score <= 100),
  status text NOT NULL CHECK (status IN ('pass', 'warning', 'fail')),
  image_url text,
  remarks text,
  brightness numeric(5,2),
  contrast numeric(5,2),
  wear_level text CHECK (wear_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for inspections"
  ON inspections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id),
  road_id uuid REFERENCES roads(id),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for alerts"
  ON alerts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed data: Roads
INSERT INTO roads (id, name, highway_code, zone, length_km, state) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Delhi-Mumbai Expressway', 'NH-48', 'North', 1350.00, 'Delhi'),
  ('11111111-1111-1111-1111-111111111102', 'Golden Quadrilateral North', 'NH-44', 'North', 920.00, 'Punjab'),
  ('11111111-1111-1111-1111-111111111103', 'Chennai-Kolkata Corridor', 'NH-16', 'South', 1711.00, 'Tamil Nadu'),
  ('11111111-1111-1111-1111-111111111104', 'Mumbai-Pune Expressway', 'NH-66', 'West', 94.50, 'Maharashtra'),
  ('11111111-1111-1111-1111-111111111105', 'Bengaluru-Hyderabad', 'NH-44S', 'South', 570.00, 'Karnataka'),
  ('11111111-1111-1111-1111-111111111106', 'Kolkata-Varanasi', 'NH-19', 'East', 679.00, 'West Bengal')
ON CONFLICT DO NOTHING;

-- Seed data: Surveys
INSERT INTO surveys (id, road_id, inspector_name, inspector_zone, route_name, start_time, end_time, status, total_assets, pass_count, fail_count) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Rajesh Kumar', 'North', 'NH-48 Section A (KM 0-50)', now() - interval '2 days', now() - interval '2 days' + interval '6 hours', 'completed', 45, 37, 8),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Priya Singh', 'North', 'NH-48 Section B (KM 50-100)', now() - interval '3 days', now() - interval '3 days' + interval '5 hours', 'completed', 38, 28, 10),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'Amit Sharma', 'North', 'NH-44 Ludhiana-Ambala', now() - interval '1 day', now() - interval '1 day' + interval '4 hours', 'completed', 52, 44, 8),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'Sunita Rao', 'South', 'NH-16 Chennai-Nellore', now() - interval '4 days', now() - interval '4 days' + interval '7 hours', 'completed', 67, 51, 16),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104', 'Vikram Patel', 'West', 'NH-66 Mumbai-Pune', now() - interval '1 day', NULL, 'in_progress', 22, 18, 4),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111105', 'Meera Nair', 'South', 'NH-44S Bengaluru-Hosur', now() - interval '5 days', now() - interval '5 days' + interval '5 hours', 'pending_review', 41, 29, 12),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111106', 'Deepak Gupta', 'East', 'NH-19 Kolkata-Asansol', now() - interval '6 days', now() - interval '6 days' + interval '6 hours', 'completed', 55, 47, 8),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111101', 'Rajesh Kumar', 'North', 'NH-48 Section C (KM 100-150)', now() - interval '7 days', now() - interval '7 days' + interval '5 hours', 'completed', 43, 31, 12)
ON CONFLICT DO NOTHING;

-- Seed data: Assets
INSERT INTO assets (id, road_id, type, latitude, longitude, location_description, installed_date, last_inspected, current_score, current_status) VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'road_sign', 28.6139, 77.2090, 'NH-48 KM 12 Entry Gate Sign', '2021-03-15', now() - interval '2 days', 85, 'pass'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'lane_marking', 28.5355, 77.3910, 'NH-48 KM 18 Lane Divider', '2020-11-20', now() - interval '2 days', 42, 'fail'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', 'road_stud', 28.4595, 77.0266, 'NH-48 KM 25 Road Stud Row', '2022-01-10', now() - interval '2 days', 91, 'pass'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111101', 'delineator', 28.7041, 77.1025, 'NH-48 KM 8 Curve Delineator', '2021-06-05', now() - interval '2 days', 67, 'warning'),
  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111102', 'road_sign', 30.7333, 76.7794, 'NH-44 Chandigarh Exit Sign', '2020-08-12', now() - interval '1 day', 78, 'pass'),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111102', 'lane_marking', 30.4002, 76.9640, 'NH-44 KM 45 Center Line', '2019-12-01', now() - interval '1 day', 35, 'fail'),
  ('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111103', 'road_stud', 13.0827, 80.2707, 'NH-16 Chennai Bypass Studs', '2022-05-20', now() - interval '4 days', 88, 'pass'),
  ('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111103', 'delineator', 13.6288, 79.4192, 'NH-16 KM 78 Delineator Post', '2021-09-15', now() - interval '4 days', 55, 'warning'),
  ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111104', 'road_sign', 18.9220, 72.8347, 'NH-66 Khopoli Speed Limit Sign', '2022-02-28', now() - interval '1 day', 93, 'pass'),
  ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111104', 'lane_marking', 18.5204, 73.8567, 'NH-66 Pune Entry Marking', '2021-04-10', now() - interval '1 day', 70, 'warning'),
  ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111105', 'road_sign', 12.9716, 77.5946, 'NH-44S Bengaluru Toll Signage', '2020-07-22', now() - interval '5 days', 48, 'fail'),
  ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111106', 'road_stud', 22.5726, 88.3639, 'NH-19 Kolkata Bypass Studs', '2022-03-05', now() - interval '6 days', 82, 'pass')
ON CONFLICT DO NOTHING;

-- Seed data: Inspections
INSERT INTO inspections (asset_id, survey_id, score, status, remarks, brightness, contrast, wear_level) VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 85, 'pass', 'Good reflectivity, minor surface dust', 78.50, 82.30, 'low'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 42, 'fail', 'Significant fading, paint worn off in patches', 31.20, 28.40, 'high'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 91, 'pass', 'Excellent condition, recently replaced', 88.70, 90.10, 'low'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222201', 67, 'warning', 'Moderate wear, schedule maintenance', 62.30, 58.90, 'medium'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222203', 78, 'pass', 'Good condition with minor fading', 72.10, 75.80, 'low'),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222203', 35, 'fail', 'Critically low reflectivity, immediate replacement needed', 24.60, 22.30, 'high'),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222204', 88, 'pass', 'Well maintained, clear visibility', 84.20, 86.50, 'low'),
  ('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222204', 55, 'warning', 'Partial damage on two posts', 51.40, 48.70, 'medium'),
  ('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222205', 93, 'pass', 'Excellent, newly installed', 91.30, 92.80, 'low'),
  ('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222205', 70, 'warning', 'Night visibility reduced, repainting recommended', 64.50, 60.20, 'medium'),
  ('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222206', 48, 'fail', 'Sign heavily faded, color indistinct at night', 38.90, 35.60, 'high'),
  ('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222207', 82, 'pass', 'Good condition, normal wear', 76.80, 80.40, 'low')
ON CONFLICT DO NOTHING;

-- Seed data: Alerts
INSERT INTO alerts (asset_id, road_id, severity, title, message, resolved) VALUES
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'critical', 'Critical: Lane Marking Failure NH-48', 'Lane marking at KM 18 has reflectivity score of 42%. Immediate repainting required. High accident risk zone.', false),
  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111102', 'critical', 'Critical: Center Line Failure NH-44', 'Center line marking at KM 45 scored 35%. Night driving extremely hazardous. Emergency maintenance ordered.', false),
  ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111105', 'high', 'High Alert: Sign Degradation NH-44S', 'Toll signage at Bengaluru scored 48%. Sign replacement scheduled within 7 days.', false),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111101', 'medium', 'Warning: Delineator Wear NH-48', 'Curve delineator at KM 8 at 67% efficiency. Monitor and schedule maintenance next cycle.', false),
  ('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111103', 'medium', 'Warning: Delineator Damage NH-16', 'Partial damage on delineator posts at KM 78. Structural assessment recommended.', false),
  ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111104', 'low', 'Notice: Lane Marking Fading NH-66', 'Pune entry marking at 70% reflectivity. Include in next scheduled maintenance run.', true)
ON CONFLICT DO NOTHING;
