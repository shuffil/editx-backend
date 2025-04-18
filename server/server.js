import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';
import previewRoutes from './routes/previewRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/upload', uploadRoutes);    // Handle video + context upload
app.use('/preview', previewRoutes);  // Serve generated video

// Optional health check
app.get('/', (req, res) => {
  res.send('EditX backend is live');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
