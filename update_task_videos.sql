-- 1st Video
UPDATE tasks 
SET video_url = 'https://videos.pexels.com/video-files/4255157/4255157-sd_640_360_25fps.mp4'
WHERE id = (SELECT id FROM tasks ORDER BY id ASC LIMIT 1 OFFSET 0);

-- 2nd Video
UPDATE tasks 
SET video_url = 'https://videos.pexels.com/video-files/4255013/4255013-sd_640_360_25fps.mp4'
WHERE id = (SELECT id FROM tasks ORDER BY id ASC LIMIT 1 OFFSET 1);

-- 3rd Video
UPDATE tasks 
SET video_url = 'https://videos.pexels.com/video-files/4255154/4255154-sd_640_360_25fps.mp4'
WHERE id = (SELECT id FROM tasks ORDER BY id ASC LIMIT 1 OFFSET 2);

-- 4th Video
UPDATE tasks 
SET video_url = 'https://videos.pexels.com/video-files/3125907/3125907-sd_640_360_25fps.mp4'
WHERE id = (SELECT id FROM tasks ORDER BY id ASC LIMIT 1 OFFSET 3);
