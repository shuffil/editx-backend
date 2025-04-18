import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), async (req, res) => {
  try {
    console.log('📩 POST /upload route hit');

    const files = req.files || [];
    const context = req.body.context || '';
    const sessionId = uuidv4();

    console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);
    console.log('🔍 Verifying file structure:', files);

    if (!Array.isArray(files) || files.length === 0) {
      console.error('❌ No valid files received.');
      return res.status(400).json({ error: 'No video files provided.' });
    }

    console.log(`📦 Files:`, files.map(f => f?.originalname ?? '[no name]'));

    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const originalName = file?.originalname ?? `unnamed-${Date.now()}.mp4`;
      const destination = path.join(sessionPath, originalName);
      console.log(`➡️ Moving file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    console.log('📦 Files moved successfully. Importing orchestrator...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module imported');

    console.log(`🚀 Starting orchestration for session: ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Orchestration complete for session: ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ Caught critical error: ${err.stack}`);
    res.status(500).json({ error: 'Upload pipeline failed.' });
  }
});

export default router;
