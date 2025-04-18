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

    const context = req.body.context || '';
    const sessionId = uuidv4();

    const files = Array.isArray(req.files) ? req.files : [];
    console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);
    console.log('🔍 Raw file structure:', files);
    console.log('📦 Filenames:', files.map(f => f?.originalname ?? '[no name]'));

    if (!files.length) {
      console.error('❌ No valid video files received.');
      return res.status(400).json({ error: 'No video files provided.' });
    }

    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder at: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const originalName = file?.originalname ?? `unnamed-${Date.now()}.mp4`;
      const destination = path.join(sessionPath, originalName);
      console.log(`➡️ Moving file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    console.log('📦 Files moved. Importing orchestrator...');
    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module loaded');

    console.log(`🚀 Starting processing for session: ${sessionId}`);
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Finished processing for session: ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ TOTAL FAILURE in route: ${err.stack}`);
    res.status(500).json({ error: 'Upload failed at top level' });
  }
});

export default router;
