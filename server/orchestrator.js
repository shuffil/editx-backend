import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startProcessing(sessionId) {
  console.log(`🎬 Orchestrator: Starting full pipeline for session: ${sessionId}`);

  const sessionFolder = path.join(__dirname, 'uploads', sessionId);
  const files = fs.readdirSync(sessionFolder).filter(f => f.endsWith('.mp4'));

  if (files.length === 0) {
    throw new Error('No MP4 files found in session folder');
  }

  const firstFile = files[0];
  const inputPath = path.join(sessionFolder, firstFile);
  const outputPath = path.join(__dirname, 'exports', `${sessionId}.mp4`);

  // Minimal simulation of processing (just copy the file for now)
  fs.copyFileSync(inputPath, outputPath);
  console.log(`✅ Orchestrator: Preview generated at ${outputPath}`);

  return { preview: `/preview/${sessionId}` };
}
