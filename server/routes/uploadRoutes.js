import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid'; // ✅ Correct ESM import
import fs from 'fs';
import path from 'path';
import { startProcessing } from '../orchestrator.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), async (req, res) => {
  try {
    console.log(`📩 Reached POST /upload`);
    const files = req.files;
    const context = req.body.context || '';
    const sessionId = uuidv4();

    console.log(`✅ Upload received. Session: ${sessionId}, Files: ${files.length}`);
    console.log(`📦 Safely logging received files:`);
    files.forEach((f, i) => {
      console.log(`📦 File[${i}]: name=${f.originalname}, path=${f.path}`);
    });

    const sessionPath = path.join('uploads', sessionId);
    fs.mkdirSync(sessionPath, { recursive: true });

    files.forEach(file => {
      const destination = path.join(sessionPath, file.originalname);
      console.log(`➡️ Copying file: ${file.path} → ${destination}`);
      fs.renameSync(file.path, destination);
    });

    console.log(`📦 Files copied. Importing orchestrator...`);
    await startProcessing(sessionId, context, files);

    res.json({ sessionId });
  } catch (err) {
    console.error(`❌ Caught error in upload route: ${err}`);
    res.status(500).json({ error: 'Upload failed at top level.' });
  }
});

export default router;
