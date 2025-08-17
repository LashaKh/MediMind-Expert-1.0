-- Clinical Trials Monitoring Database Schema
-- This migration adds tables for saving and monitoring clinical trials

-- Trial monitors table for saved searches
CREATE TABLE IF NOT EXISTS trial_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_criteria JSONB NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  notifications JSONB DEFAULT '{"email": false, "inApp": true}',
  last_checked TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial monitor results table
CREATE TABLE IF NOT EXISTS trial_monitor_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES trial_monitors(id) ON DELETE CASCADE,
  nct_id TEXT NOT NULL,
  status TEXT,
  previous_status TEXT,
  title TEXT,
  change_type TEXT CHECK (change_type IN ('new_trial', 'status_change')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(monitor_id, nct_id)
);

-- Saved trials table
CREATE TABLE IF NOT EXISTS saved_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nct_id TEXT NOT NULL,
  trial_data JSONB,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nct_id)
);

-- Indexes for performance
CREATE INDEX idx_trial_monitors_user_id ON trial_monitors(user_id);
CREATE INDEX idx_trial_monitors_active ON trial_monitors(is_active) WHERE is_active = true;
CREATE INDEX idx_trial_monitor_results_monitor ON trial_monitor_results(monitor_id);
CREATE INDEX idx_saved_trials_user ON saved_trials(user_id);
CREATE INDEX idx_saved_trials_nct_id ON saved_trials(nct_id);
CREATE INDEX idx_saved_trials_tags ON saved_trials USING GIN(tags);

-- Row Level Security
ALTER TABLE trial_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_monitor_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_trials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trial_monitors
CREATE POLICY "Users can view their own monitors" ON trial_monitors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monitors" ON trial_monitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitors" ON trial_monitors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitors" ON trial_monitors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for trial_monitor_results
CREATE POLICY "Users can view their monitor results" ON trial_monitor_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trial_monitors 
      WHERE trial_monitors.id = trial_monitor_results.monitor_id 
      AND trial_monitors.user_id = auth.uid()
    )
  );

-- RLS Policies for saved_trials
CREATE POLICY "Users can view their own saved trials" ON saved_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save trials" ON saved_trials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved trials" ON saved_trials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved trials" ON saved_trials
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_trial_monitors_updated_at BEFORE UPDATE ON trial_monitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_trials_updated_at BEFORE UPDATE ON saved_trials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();