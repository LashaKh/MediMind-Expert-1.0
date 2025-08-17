-- ABG Processing Temporary Coordination Tables
-- Replicates the Make.com datastore functionality for coordinating multi-step ABG processing

-- Create temporary processing coordination table
CREATE TABLE IF NOT EXISTS abg_processing_temp (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id text NOT NULL UNIQUE,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour'), -- Auto-expire after 1 hour
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_abg_processing_temp_request_id ON abg_processing_temp(request_id);
CREATE INDEX IF NOT EXISTS idx_abg_processing_temp_status ON abg_processing_temp(processing_status);
CREATE INDEX IF NOT EXISTS idx_abg_processing_temp_expires_at ON abg_processing_temp(expires_at);
CREATE INDEX IF NOT EXISTS idx_abg_processing_temp_created_at ON abg_processing_temp(created_at);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_abg_processing_temp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_abg_processing_temp_updated_at
  BEFORE UPDATE ON abg_processing_temp
  FOR EACH ROW
  EXECUTE FUNCTION update_abg_processing_temp_updated_at();

-- Create cleanup function for expired records (to prevent table bloat)
CREATE OR REPLACE FUNCTION cleanup_expired_abg_processing_temp()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM abg_processing_temp 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  RAISE NOTICE 'Cleaned up % expired ABG processing temp records', deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- This would typically be set up separately if pg_cron is available
-- SELECT cron.schedule('abg-temp-cleanup', '*/15 * * * *', 'SELECT cleanup_expired_abg_processing_temp();');

-- Add comments for documentation
COMMENT ON TABLE abg_processing_temp IS 'Temporary coordination table for multi-step ABG processing workflow, replicating Make.com datastore functionality';
COMMENT ON COLUMN abg_processing_temp.request_id IS 'Unique request identifier for tracking workflow progress';
COMMENT ON COLUMN abg_processing_temp.issues IS 'JSON array of identified issues from ABG interpretation';
COMMENT ON COLUMN abg_processing_temp.processing_status IS 'Current status of the processing workflow';
COMMENT ON COLUMN abg_processing_temp.expires_at IS 'Automatic expiration time to prevent table bloat';
COMMENT ON COLUMN abg_processing_temp.metadata IS 'Additional metadata for workflow coordination';

-- Row Level Security (RLS) - Since this is temporary processing data, we'll allow access but with time limits
ALTER TABLE abg_processing_temp ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own processing records
CREATE POLICY "Users can read processing temp records for limited time"
ON abg_processing_temp
FOR SELECT TO authenticated
USING (created_at >= (now() - interval '1 hour'));

-- Allow system/functions to manage temp records  
CREATE POLICY "System can manage temp processing records"
ON abg_processing_temp
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON abg_processing_temp TO authenticated;
GRANT USAGE ON SEQUENCE abg_processing_temp_id_seq TO authenticated;