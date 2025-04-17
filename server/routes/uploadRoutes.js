import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('videos'), (req, res) => {
  const files = req.files;
  const context = req.body.context;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No videos uploaded' });
  }

  const sessionId = uuidv4();
  console.log(`Upload received. Session: ${sessionId}, Files: ${files.length}`);

  res.json({ sessionId });
});

export default router;
