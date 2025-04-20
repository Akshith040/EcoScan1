-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_history table
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  waste_type TEXT,
  confidence FLOAT,
  user_description TEXT,
  recycling_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_insert_anon ON users;
DROP POLICY IF EXISTS user_history_select_own ON user_history;
DROP POLICY IF EXISTS user_history_insert_authenticated ON user_history;

-- Create policies for the users table
-- Allow anonymous access for registration
CREATE POLICY users_insert_anon ON users 
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow users to view their own data
CREATE POLICY users_select_own ON users 
  FOR SELECT USING (auth.uid() = id);

-- Create policies for the user_history table
-- Allow users to view their own history
CREATE POLICY user_history_select_own ON user_history 
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own history
CREATE POLICY user_history_insert_authenticated ON user_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);