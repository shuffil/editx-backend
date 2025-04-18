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

    if (!files.length) {
      console.error('❌ No video files received.');
      return res.status(400).json({ error: 'No video files provided.' });
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      console.log(`📦 File[${i}] → originalname: ${f?.originalname}, path: ${f?.path}`);
    }

    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder at: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const originalName = file?.originalname ?? `unnamed-${Date.now()}.mp4`;
      const destination = path.join(sessionPath, originalName);
      console.log(`➡️ Copying file: ${file.path} → ${destination}`);
      fs.copyFileSync(file.path, destination);
      fs.unlinkSync(file.path);
    }

    console.log('📦 Files copied. Importing orchestrator...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module loaded');

    console.log(`🚀 Starting processing for session: ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Processing complete for session: ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error('❌ Critical error in upload route:', err.stack);
    res.status(500).json({ error: 'Upload failed at top level.' });
  }
});

export default router;
