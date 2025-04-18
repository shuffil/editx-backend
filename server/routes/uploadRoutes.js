import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { startProcessing } from '../orchestrator.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // ensure this folder exists

router.post('/', upload.array('videos'), async (req, res) => {
  const files = req.files;
  const context = req.body.context || '';
  const sessionId = uuidv4();

  console.log(`Upload received. Session: ${sessionId}, Files: ${files.length}`);

  // Create a session-specific folder inside /uploads/
  const sessionPath = path.join('uploads', sessionId);
  fs.mkdirSync(sessionPath, { recursive: true });

  // Move uploaded files into the session folder
  files.forEach(file => {
    const destination = path.join(sessionPath, file.originalname);
    fs.renameSync(file.path, destination);
  });

  try {
    // Kick off orchestration (runs agents + render)
    startProcessing(sessionId, context, files);
    res.json({ sessionId });
  } catch (err) {
    console.error(`Error during upload processing: ${err.message}`);
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

export default router;
