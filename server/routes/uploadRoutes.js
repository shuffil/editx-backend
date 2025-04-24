import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { startProcessing } from '../orchestrator.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${uuidv4()}.mp4`)
});

const upload = multer({ storage });

router.post('/upload', upload.array('videos', 10), async (req, res) => {
  const sessionId = uuidv4();
  const sessionPath = path.join(__dirname, '..', 'uploads', sessionId);

  fs.mkdirSync(sessionPath, { recursive: true });

  for (const file of req.files) {
    const dest = path.join(sessionPath, file.originalname);
    fs.copyFileSync(file.path, dest);
  }

  const result = await startProcessing(sessionId);
  res.json({ success: true, sessionId, result });
});

export default router;
