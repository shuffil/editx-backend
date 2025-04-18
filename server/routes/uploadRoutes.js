import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Ensure this folder exists

let startProcessing;

try {
  const orchestrator = await import('../orchestrator.js');
  startProcessing = orchestrator.startProcessing;
  console.log('✅ startProcessing successfully imported');
} catch (err) {
  console.error('❌ Failed to import orchestrator.js:', err.message);
}

router.post('/', upload.array('videos'), async (req, res) => {
  const files = req.files;
  const context = req.body.context || '';
  const sessionId = uuidv4();

  console.log(`Upload received. Session: ${sessionId}, Files: ${files.length}`);

  const sessionPath = path.join('uploads', sessionId);
  fs.mkdirSync(sessionPath, { recursive: true });

  files.forEach(file => {
    const destination = path.join(sessionPath, file.originalname);
    fs.renameSync(file.path, destination);
  });

  try {
    console.log(`✅ About to start orchestrator for session: ${sessionId}`);
    await startProcessing(sessionId, context, files);
    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ Error during orchestration: ${err.message}`);
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

export default router;
