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

  try {
    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const destination = path.join(sessionPath, file.originalname);
      console.log(`➡️ Moving ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    console.log('✅ All files moved. Attempting to import orchestrator...');

    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module imported successfully');

    console.log(`🧠 Calling startProcessing for session ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Orchestration completed for session ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ Critical error: ${err.stack}`);
    res.status(500).json({ error: 'Internal server error during upload.' });
  }
});

export default router;
