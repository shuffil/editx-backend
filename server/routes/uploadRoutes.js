import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), async (req, res) => {
  try {
    console.log('📩 Reached POST /upload');

    const context = req.body.context || '';
    const sessionId = uuidv4();

    const files = Array.isArray(req.files) ? req.files : [];
    console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);

    // Ultra-safe log: show files one by one
    if (!files.length) {
      console.error('❌ No files received or req.files is not an array');
      return res.status(400).json({ error: 'No videos received' });
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      console.log(`📦 File[${i}] → originalname: ${f?.originalname}, path: ${f?.path}`);
    }

    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating folder: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const originalName = file?.originalname || `unnamed-${Date.now()}.mp4`;
      const destination = path.join(sessionPath, originalName);
      console.log(`➡️ Moving file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    console.log('📦 Files moved. Importing orchestrator...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module loaded');

    console.log(`🚀 Starting processing for session: ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Processing complete for session: ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error('❌ Caught error in upload route:', err.stack);
    res.status(500).json({ error: 'Upload pipeline failed' });
  }
});

export default router;
