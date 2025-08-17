-- Performance Monitoring Tables for Medical News Application
-- Creates tables to store performance metrics, errors, and monitoring data

-- Performance sessions table
CREATE TABLE IF NOT EXISTS performance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  specialty TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  device_info JSONB,
  network_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page load metrics table
CREATE TABLE IF NOT EXISTS performance_page_load_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES performance_sessions(session_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  medical_content BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API metrics table
CREATE TABLE IF NOT EXISTS performance_api_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES performance_sessions(session_id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  endpoint TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Web Vitals table
CREATE TABLE IF NOT EXISTS performance_web_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES performance_sessions(session_id) ON DELETE CASCADE,
  vital_name TEXT NOT NULL,
  vital_value NUMERIC NOT NULL,
  rating TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical content performance table
CREATE TABLE IF NOT EXISTS performance_medical_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES performance_sessions(session_id) ON DELETE CASCADE,
  news_load_time NUMERIC DEFAULT 0,
  calculator_response_time NUMERIC DEFAULT 0,
  search_results_time NUMERIC DEFAULT 0,
  image_load_time NUMERIC DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance errors table
CREATE TABLE IF NOT EXISTS performance_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES performance_sessions(session_id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_sessions_user_id ON performance_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_specialty ON performance_sessions(specialty);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_timestamp ON performance_sessions(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_page_load_session_id ON performance_page_load_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_page_load_medical ON performance_page_load_metrics(medical_content);
CREATE INDEX IF NOT EXISTS idx_performance_page_load_timestamp ON performance_page_load_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_api_session_id ON performance_api_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_api_endpoint ON performance_api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_api_timestamp ON performance_api_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_web_vitals_session_id ON performance_web_vitals(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_web_vitals_name ON performance_web_vitals(vital_name);
CREATE INDEX IF NOT EXISTS idx_performance_web_vitals_timestamp ON performance_web_vitals(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_medical_session_id ON performance_medical_content(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_medical_timestamp ON performance_medical_content(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_errors_session_id ON performance_errors(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_errors_type ON performance_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_performance_errors_timestamp ON performance_errors(timestamp);

-- Enable Row Level Security
ALTER TABLE performance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_page_load_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_medical_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow users to access their own performance data
CREATE POLICY "Users can view their own performance sessions" ON performance_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own performance sessions" ON performance_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Allow performance metrics to be inserted and viewed for sessions
CREATE POLICY "Performance metrics are viewable for session owners" ON performance_page_load_metrics
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM performance_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Performance metrics can be inserted" ON performance_page_load_metrics
  FOR INSERT WITH CHECK (true);

-- Similar policies for other metrics tables
CREATE POLICY "API metrics are viewable for session owners" ON performance_api_metrics
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM performance_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "API metrics can be inserted" ON performance_api_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Web vitals are viewable for session owners" ON performance_web_vitals
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM performance_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Web vitals can be inserted" ON performance_web_vitals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Medical content metrics are viewable for session owners" ON performance_medical_content
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM performance_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Medical content metrics can be inserted" ON performance_medical_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Performance errors are viewable for session owners" ON performance_errors
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM performance_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Performance errors can be inserted" ON performance_errors
  FOR INSERT WITH CHECK (true);

-- Create a view for performance analytics
CREATE OR REPLACE VIEW performance_analytics AS
SELECT 
  ps.specialty,
  ps.timestamp::date as date,
  COUNT(DISTINCT ps.session_id) as session_count,
  AVG(ppl.metric_value) FILTER (WHERE ppl.metric_name = 'full_page_load') as avg_page_load,
  AVG(pam.metric_value) FILTER (WHERE pam.metric_name = 'api_response_time') as avg_api_response,
  AVG(pmc.news_load_time) FILTER (WHERE pmc.news_load_time > 0) as avg_news_load,
  AVG(pmc.calculator_response_time) FILTER (WHERE pmc.calculator_response_time > 0) as avg_calculator_response,
  AVG(pmc.search_results_time) FILTER (WHERE pmc.search_results_time > 0) as avg_search_response,
  COUNT(pe.id) as error_count,
  COUNT(pe.id) FILTER (WHERE pe.error_type = 'medical_data') as medical_error_count
FROM performance_sessions ps
LEFT JOIN performance_page_load_metrics ppl ON ps.session_id = ppl.session_id
LEFT JOIN performance_api_metrics pam ON ps.session_id = pam.session_id
LEFT JOIN performance_medical_content pmc ON ps.session_id = pmc.session_id
LEFT JOIN performance_errors pe ON ps.session_id = pe.session_id
WHERE ps.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY ps.specialty, ps.timestamp::date
ORDER BY ps.timestamp::date DESC;

-- Grant permissions for authenticated users to view analytics
GRANT SELECT ON performance_analytics TO authenticated;

-- Function to clean up old performance data (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete old performance data (90 days)
  DELETE FROM performance_sessions 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- The CASCADE will automatically clean up related metrics
END;
$$;

-- Schedule cleanup function (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-performance-data', '0 2 * * 0', 'SELECT cleanup_old_performance_data();');