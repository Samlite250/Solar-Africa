-- UPDATE ACTIVE TASKS TO GOOGLE CLOUD SAMPLE MEDIA

-- 1st Active Video
UPDATE tasks 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
WHERE id = (SELECT id FROM tasks WHERE active = true ORDER BY id ASC LIMIT 1 OFFSET 0);

-- 2nd Active Video
UPDATE tasks 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
WHERE id = (SELECT id FROM tasks WHERE active = true ORDER BY id ASC LIMIT 1 OFFSET 1);

-- 3rd Active Video
UPDATE tasks 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
WHERE id = (SELECT id FROM tasks WHERE active = true ORDER BY id ASC LIMIT 1 OFFSET 2);

-- 4th Active Video
UPDATE tasks 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
WHERE id = (SELECT id FROM tasks WHERE active = true ORDER BY id ASC LIMIT 1 OFFSET 3);

-- Verify the update
SELECT id, title, video_url, active FROM tasks WHERE active = true;
