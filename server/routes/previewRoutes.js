import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Enable path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve video from /exports/:sessionId.mp4
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const videoPath = path.join(__dirname, '..', '..', 'exports', `${sessionId}.mp4`);

  res.sendFile(videoPath, (err) => {
    if (err) {
      console.error('❌ Failed to send video:', err);
      res.status(404).send('Video not found');
    } else {
      console.log(`✅ Served video: ${videoPath}`);
    }
  });
});

export default router;
