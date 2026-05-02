-- SQL script to populate the tasks table with 4 professional solar energy advertisements
-- This ensures the user sees exactly 4 distinct tasks as requested.

-- 1. Ensure required columns exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '☀️';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Video Ad';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 15;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reward TEXT DEFAULT '3,500 FBu';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Ensure tasks are publicly viewable by users
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);

-- 2. Clear existing tasks to avoid duplicates or old content
TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;

-- 2. Insert 4 premium solar advertisement tasks
INSERT INTO tasks (icon, title, video_url, duration, reward, active)
VALUES 
  (
    '☀️', 
    'Solar Africa: The Renewable Revolution', 
    'https://videos.pexels.com/video-files/4255157/4255157-sd_640_360_25fps.mp4', 
    15, 
    '3,500 FBu', 
    true
  ),
  (
    '⚡', 
    'Smart Energy: Professional Solar Tech', 
    'https://videos.pexels.com/video-files/4255013/4255013-sd_640_360_25fps.mp4', 
    20, 
    '3,500 FBu', 
    true
  ),
  (
    '🌍', 
    'Clean Power: Sustaining Our Planet', 
    'https://videos.pexels.com/video-files/4255154/4255154-sd_640_360_25fps.mp4', 
    15, 
    '3,500 FBu', 
    true
  ),
  (
    '🔋', 
    'Future Storage: Next-Gen Batteries', 
    'https://videos.pexels.com/video-files/3125907/3125907-sd_640_360_25fps.mp4', 
    18, 
    '3,500 FBu', 
    true
  );

-- Verify the insertion
SELECT * FROM tasks;
