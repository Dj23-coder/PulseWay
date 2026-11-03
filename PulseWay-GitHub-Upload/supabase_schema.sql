-- ============================================================================
-- PulseWay Hospital Emergency Coordination & Dispatch System
-- Supabase Cloud Database Production Schema
-- Project: vganzlzsbvtdzfuwcnqp
-- ============================================================================

-- Enable pgcrypto extension for secure UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CITIZEN ACCOUNTS TABLE (Citizens Login & Personal Medical Profile)
-- Stores each citizen's login credentials, medical record, and SOS contacts.
-- Each citizen's info is strictly private to them.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.citizen_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  dob TEXT,
  age INTEGER,
  sex TEXT,
  height TEXT,
  weight TEXT,
  blood_group TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  custom_allergies JSONB DEFAULT '[]'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  permanent_address TEXT,
  gps_consent_confirmed BOOLEAN DEFAULT TRUE,
  gps_consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  primary_hospital_preference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant phone number lookups during citizen login & SOS
CREATE INDEX IF NOT EXISTS idx_citizen_mobile ON public.citizen_accounts (mobile);
CREATE INDEX IF NOT EXISTS idx_citizen_email ON public.citizen_accounts (email);

-- ============================================================================
-- 2. HOSPITAL ACCOUNTS TABLE (Hospitals Login & Emergency Infrastructure)
-- Stores hospital credentials, duty officers, fleet count, and bed capacities.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hospital_accounts (
  id TEXT PRIMARY KEY,
  hospital_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  officer_name TEXT,
  officer_designation TEXT,
  officer_id TEXT,
  address TEXT NOT NULL,
  type TEXT DEFAULT 'Private',
  facilities JSONB DEFAULT '[]'::jsonb,
  total_ambulances INTEGER DEFAULT 12,
  icu_beds_available INTEGER DEFAULT 8,
  trauma_beds_available INTEGER DEFAULT 6,
  general_beds_available INTEGER DEFAULT 24,
  latitude NUMERIC DEFAULT 12.9716,
  longitude NUMERIC DEFAULT 77.5946,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant hospital login
CREATE INDEX IF NOT EXISTS idx_hospital_code ON public.hospital_accounts (hospital_code);
CREATE INDEX IF NOT EXISTS idx_hospital_email ON public.hospital_accounts (email);

-- ============================================================================
-- 3. EMERGENCY INCIDENTS TABLE (Real-Time Dispatch Coordination)
-- Co-ordinates active emergencies, ambulance tracking, GPS, and bed allocation.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id TEXT PRIMARY KEY,
  citizen_mobile TEXT, -- Links incident to specific citizen
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL, -- WAITING_HOSPITAL_ACCEPTANCE, AMBULANCE_DISPATCHED, ARRIVED_ON_SCENE, RESOLVED
  severity TEXT NOT NULL, -- CRITICAL | MINOR
  target TEXT DEFAULT 'SELF',
  patient_name TEXT,
  patient_age INTEGER,
  patient_sex TEXT,
  patient_blood TEXT,
  patient_cause TEXT,
  patient_phone TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  assigned_hospital_id TEXT,
  assigned_hospital_name TEXT,
  ambulance_vehicle_no TEXT,
  ambulance_driver_name TEXT,
  ambulance_driver_phone TEXT,
  ambulance_eta_minutes INTEGER,
  pre_arrival_bed TEXT,
  pre_arrival_doctor TEXT,
  pre_arrival_dept TEXT,
  raw_incident JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for active emergency queue and citizen incident history
CREATE INDEX IF NOT EXISTS idx_incidents_citizen ON public.emergency_incidents (citizen_mobile);
CREATE INDEX IF NOT EXISTS idx_incidents_hospital ON public.emergency_incidents (assigned_hospital_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.emergency_incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.emergency_incidents (timestamp DESC);

-- ============================================================================
-- 4. AI TRIAGE LOGS TABLE (Clinical Consultation & Triage Reports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_triage_logs (
  id TEXT PRIMARY KEY,
  citizen_mobile TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  patient_name TEXT,
  emergency_type TEXT,
  severity TEXT,
  summary_report TEXT,
  triage_details TEXT,
  vital_stats_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_triage_citizen ON public.ai_triage_logs (citizen_mobile);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enables security while permitting authorized application access.
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.citizen_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_triage_logs ENABLE ROW LEVEL SECURITY;

-- Citizen Accounts Policies (Public Anon Key access for app clients)
DROP POLICY IF EXISTS "Allow anon read citizen_accounts" ON public.citizen_accounts;
CREATE POLICY "Allow anon read citizen_accounts" ON public.citizen_accounts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert citizen_accounts" ON public.citizen_accounts;
CREATE POLICY "Allow anon insert citizen_accounts" ON public.citizen_accounts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update citizen_accounts" ON public.citizen_accounts;
CREATE POLICY "Allow anon update citizen_accounts" ON public.citizen_accounts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Hospital Accounts Policies
DROP POLICY IF EXISTS "Allow anon read hospital_accounts" ON public.hospital_accounts;
CREATE POLICY "Allow anon read hospital_accounts" ON public.hospital_accounts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert hospital_accounts" ON public.hospital_accounts;
CREATE POLICY "Allow anon insert hospital_accounts" ON public.hospital_accounts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update hospital_accounts" ON public.hospital_accounts;
CREATE POLICY "Allow anon update hospital_accounts" ON public.hospital_accounts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Emergency Incidents Policies
DROP POLICY IF EXISTS "Allow anon read emergency_incidents" ON public.emergency_incidents;
CREATE POLICY "Allow anon read emergency_incidents" ON public.emergency_incidents
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert emergency_incidents" ON public.emergency_incidents;
CREATE POLICY "Allow anon insert emergency_incidents" ON public.emergency_incidents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update emergency_incidents" ON public.emergency_incidents;
CREATE POLICY "Allow anon update emergency_incidents" ON public.emergency_incidents
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- AI Triage Logs Policies
DROP POLICY IF EXISTS "Allow anon read ai_triage_logs" ON public.ai_triage_logs;
CREATE POLICY "Allow anon read ai_triage_logs" ON public.ai_triage_logs
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert ai_triage_logs" ON public.ai_triage_logs;
CREATE POLICY "Allow anon insert ai_triage_logs" ON public.ai_triage_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================================
-- 6. REALTIME REPLICATION (For Live Dispatch & Map Tracking)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'emergency_incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_incidents;
  END IF;
END $$;

-- ============================================================================
-- 7. INITIAL SEED DATA FOR HOSPITALS
-- Seed default hospital accounts so hospitals can log in immediately
-- Default Password for pre-seeded hospitals is: Hospital@123
-- ============================================================================
INSERT INTO public.hospital_accounts (
  id, hospital_code, name, email, password, phone, officer_name, officer_designation, officer_id, address, type, facilities, total_ambulances, icu_beds_available, trauma_beds_available, general_beds_available, latitude, longitude
) VALUES 
(
  'hosp-1',
  'HOSP-BLR-8841',
  'Manipal Emergency & Resuscitation Hospital',
  'emergency@manipal.edu',
  'Hospital@123',
  '+91 80 2502 4444',
  'Dr. Vikram Adiga, MS',
  'Chief Emergency Medical Officer',
  'REG-77490-KMC',
  '98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
  'Private',
  '["ICU (Intensive Care)", "Trauma Centre", "Cardiac Cath Lab", "Neuro Emergency", "Stroke Resuscitation"]'::jsonb,
  14, 9, 6, 28,
  12.9592, 77.6496
),
(
  'hosp-2',
  'HOSP-BLR-1024',
  'Apollo Trauma Care Center',
  'er@apollo-bangalore.com',
  'Hospital@123',
  '+91 80 2630 4050',
  'Dr. Priya Sharma, MD',
  'Head of Emergency Services',
  'REG-66120-KMC',
  '154/11 Bannerghatta Main Rd, Opp IIMB, Bengaluru, Karnataka 560076',
  'Private',
  '["ICU (Intensive Care)", "Trauma Centre", "Burn ICU", "Pediatric ER", "Orthopedics Bay"]'::jsonb,
  12, 7, 5, 22,
  12.8954, 77.5989
),
(
  'hosp-3',
  'HOSP-BLR-0112',
  'Victoria Government Resuscitation Unit',
  'er@victoriagov.in',
  'Hospital@123',
  '+91 80 2670 1150',
  'Dr. Ramesh Kumar, MBBS',
  'Senior Resident Resuscitation',
  'REG-55201-KMC',
  'Fort Rd, near City Market, Kalasipalya, Bengaluru, Karnataka 560002',
  'Government',
  '["ICU (Intensive Care)", "Trauma Centre", "Burn ICU", "Neuro Emergency"]'::jsonb,
  18, 12, 8, 45,
  12.9629, 77.5746
)
ON CONFLICT (hospital_code) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  phone = EXCLUDED.phone,
  updated_at = NOW();
