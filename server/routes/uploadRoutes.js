import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), async (req, res) => {
  try {
    console.log('📩 POST /upload reached');

    const files = req.files;
    const context = req.body.context || '';
    const sessionId = uuidv4();

    if (!Array.isArray(files) || files.length === 0) {
      console.error('❌ No valid video files received');
      return res.status(400).json({ error: 'No videos received' });
    }

    console.log(`✅ Upload received. Session: ${sessionId}`);
    console.log(`🧠 Context: ${context}`);
    console.log(`📦 Files:`, files.map(f => f.originalname || '[no name]'));

    const sessionPath = path.join('uploads', sessionId);
    console.log(`📁 Creating session folder: ${sessionPath}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    for (const file of files) {
      const originalName = file.originalname || `unnamed-${Date.now()}.mp4`;
      const destination = path.join(sessionPath, originalName);
      console.log(`➡️ Moving file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    }

    const { startProcessing } = await import('../orchestrator.js');
    console.log('✅ Orchestrator module imported successfully');
    await startProcessing(sessionId, context, files);
    console.log(`🎉 Orchestration completed for session: ${sessionId}`);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ Caught error in upload route: ${err.stack}`);
    res.status(500).json({ error: 'Something went wrong during upload.' });
  }
});

export default router;
