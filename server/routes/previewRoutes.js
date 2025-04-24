import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const videoPath = path.join(__dirname, '..', '..', 'exports', `${sessionId}.mp4`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Preview not found' });
  }

  res.sendFile(videoPath);
});

export default router;
