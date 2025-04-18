import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function fxAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    const uploadPath = path.join('uploads', sessionId);
    const tempPath = path.join('temp', sessionId, 'fx');
    if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath, { recursive: true });

    // Find the first uploaded MP4 file
    const files = fs.readdirSync(uploadPath);
    const firstVideo = files.find(f => f.toLowerCase().endsWith('.mp4'));
    if (!firstVideo) {
      return reject(new Error('No MP4 file found in upload directory.'));
    }

    const inputPath = path.join(uploadPath, firstVideo);
    const outputPath = path.join(tempPath, 'fx_clip_01.mp4');

    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${outputPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.warn(`⚠️ FXAgent stderr: ${stderr}`);
      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve({ status: 'success', output: outputPath });
    });
  });
}
