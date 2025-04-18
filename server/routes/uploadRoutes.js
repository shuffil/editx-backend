import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), async (req, res) => {
  const files = req.files;
  const context = req.body.context || '';
  const sessionId = uuidv4();

  console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);

  const sessionPath = path.join('uploads', sessionId);
  fs.mkdirSync(sessionPath, { recursive: true });

  files.forEach(file => {
    const destination = path.join(sessionPath, file.originalname);
    fs.renameSync(file.path, destination);
  });

  try {
    console.log('🧪 Attempting to import orchestrator.js...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module imported successfully');

    console.log(`🧪 About to call startProcessing for session ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log('✅ Orchestration completed');

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ CRITICAL ERROR during import or orchestration: ${err.message}`);
    res.status(500).json({ error: 'Critical backend failure' });
  }
});

export default router;
