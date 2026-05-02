-- SQL script to populate the tasks table with 4 professional solar energy advertisements
-- This ensures the user sees exactly 4 distinct tasks as requested.

-- 1. Clear existing tasks to avoid duplicates or old content
TRUNCATE TABLE tasks RESTART IDENTITY;

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
