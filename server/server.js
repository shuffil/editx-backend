import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import orchestrator from "./orchestrator.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { log, error as logError } from "./utils/logger.js";
import previewRoutes from './routes/previewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/preview', previewRoutes);
app.use("/temp", express.static(path.join(__dirname, "temp")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.array("files"), async (req, res) => {
  const sessionId = uuidv4();
  log("📩 Reached POST /upload", `Session: ${sessionId}, Files: ${req.files.length}`);

  try {
    req.files.forEach((file, i) => {
      log(`📦 File[${i}]`, `name=${file.originalname}, path=${file.path}`);
    });

    const sessionFolder = path.join("uploads", sessionId);
    fs.mkdirSync(sessionFolder, { recursive: true });

    for (const file of req.files) {
      const dest = path.join(sessionFolder, file.originalname);
      fs.copyFileSync(file.path, dest);
      log("➡️ Copying file", `${file.path} → ${dest}`);
    }

    log("📦 Files copied", "Importing orchestrator...");
    const result = await orchestrator(sessionId);
    res.json({ status: "success", sessionId, result });
  } catch (err) {
    logError("Upload Handler", err);
    res.status(500).json({ error: "Upload failed. Please check your files and try again." });
  }
});

app.use("/api", uploadRoutes);

app.listen(PORT, () => {
  log("Server", `Running on port ${PORT}`);
});
