-- Migration: ABG Results Schema
-- Description: Creates tables and infrastructure for Blood Gas Analysis feature
-- Author: MediMind Expert Development Team
-- Date: 2025-08-06

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ABG results table
CREATE TABLE IF NOT EXISTS abg_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  raw_analysis text NOT NULL,
  interpretation text,
  action_plan text,
  image_url text,
  type text CHECK (type IN ('Arterial Blood Gas', 'Venous Blood Gas')) DEFAULT 'Arterial Blood Gas',
  processing_time_ms integer,
  gemini_confidence numeric(3,2) CHECK (gemini_confidence >= 0 AND gemini_confidence <= 1),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add helpful comments to columns
COMMENT ON TABLE abg_results IS 'Stores Blood Gas Analysis results with AI processing data';
COMMENT ON COLUMN abg_results.user_id IS 'References the healthcare professional who processed the ABG';
COMMENT ON COLUMN abg_results.patient_id IS 'Optional reference to patient record';
COMMENT ON COLUMN abg_results.raw_analysis IS 'Raw text analysis from Gemini Vision API';
COMMENT ON COLUMN abg_results.interpretation IS 'Clinical interpretation from Make.com webhook';
COMMENT ON COLUMN abg_results.action_plan IS 'Treatment action plan from Make.com webhook';
COMMENT ON COLUMN abg_results.image_url IS 'URL or path to uploaded ABG image';
COMMENT ON COLUMN abg_results.type IS 'Type of blood gas analysis (Arterial or Venous)';
COMMENT ON COLUMN abg_results.processing_time_ms IS 'Time taken for Gemini API processing in milliseconds';
COMMENT ON COLUMN abg_results.gemini_confidence IS 'Confidence score from Gemini Vision API (0.0 to 1.0)';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_abg_results_user_id ON abg_results(user_id);
CREATE INDEX IF NOT EXISTS idx_abg_results_created_at ON abg_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abg_results_patient_id ON abg_results(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abg_results_type ON abg_results(type);
CREATE INDEX IF NOT EXISTS idx_abg_results_user_created ON abg_results(user_id, created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_abg_results_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at timestamp
DROP TRIGGER IF EXISTS update_abg_results_updated_at ON abg_results;
CREATE TRIGGER update_abg_results_updated_at
  BEFORE UPDATE ON abg_results
  FOR EACH ROW EXECUTE FUNCTION update_abg_results_updated_at();

-- Enable Row Level Security
ALTER TABLE abg_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their ABG results" ON abg_results;
CREATE POLICY "Users can manage their ABG results"
ON abg_results FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create policy for reading ABG results
DROP POLICY IF EXISTS "Users can view their ABG results" ON abg_results;
CREATE POLICY "Users can view their ABG results"
ON abg_results FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Create policy for inserting ABG results
DROP POLICY IF EXISTS "Users can create ABG results" ON abg_results;
CREATE POLICY "Users can create ABG results"
ON abg_results FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create policy for updating ABG results
DROP POLICY IF EXISTS "Users can update their ABG results" ON abg_results;
CREATE POLICY "Users can update their ABG results"
ON abg_results FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create policy for deleting ABG results
DROP POLICY IF EXISTS "Users can delete their ABG results" ON abg_results;
CREATE POLICY "Users can delete their ABG results"
ON abg_results FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Create a minimal patients table if it doesn't exist
-- This ensures the foreign key relationship works
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  medical_record_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for patients table if it was just created
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_medical_record_number ON patients(medical_record_number) WHERE medical_record_number IS NOT NULL;

-- Enable RLS for patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
DROP POLICY IF EXISTS "Users can manage their patients" ON patients;
CREATE POLICY "Users can manage their patients"
ON patients FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger for patients table
CREATE OR REPLACE FUNCTION update_patients_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_patients_updated_at();

-- Add helpful comments to patients table
COMMENT ON TABLE patients IS 'Basic patient information for medical record keeping';
COMMENT ON COLUMN patients.user_id IS 'Healthcare professional who manages this patient';
COMMENT ON COLUMN patients.medical_record_number IS 'Optional medical record number for hospital integration';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE abg_results TO authenticated;
GRANT ALL ON TABLE patients TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Logging for successful migration
DO $$ 
BEGIN 
  RAISE NOTICE 'ABG Results schema migration completed successfully'; 
  RAISE NOTICE 'Created tables: abg_results, patients (if not exists)';
  RAISE NOTICE 'Created indexes, triggers, and RLS policies';
END $$;