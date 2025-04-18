import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default function fxAgent(sessionId) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);
    
    const uploadDir = path.join('uploads', sessionId);
    const tempDir = path.join('temp', sessionId, 'fx');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const inputFiles = fs.readdirSync(uploadDir).filter(file => file.endsWith('.mp4'));
    if (inputFiles.length === 0) return reject(new Error('No video files found in upload folder.'));
    
    const inputPath = path.join(uploadDir, inputFiles[0]);
    const outputPath = path.join(tempDir, 'fx_clip_01.mp4');

    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${outputPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.warn(`FXAgent stderr: ${stderr}`);
      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve();
    });
  });
}
