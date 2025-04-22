// server/routes/uploadRoutes.js

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const sessionId = uuidv4();
    console.log("📩 Reached POST /upload");
    console.log(`✅ Upload received. Session: ${sessionId}, Files: ${req.files.length}`);

    req.files.forEach((file, i) => {
      console.log(`📦 File[${i}]: name=${file.originalname}, path=${file.path}`);
    });

    const sessionFolder = path.join('uploads', sessionId);
    fs.mkdirSync(sessionFolder, { recursive: true });

    for (const file of req.files) {
      const dest = path.join(sessionFolder, file.originalname);
      fs.copyFileSync(file.path, dest);
      console.log(`➡️ Copying file: ${file.path} → ${dest}`);
    }

    res.status(200).json({ status: 'success', sessionId });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Upload failed. Please check your files and try again.' });
  }
});

export default router;
