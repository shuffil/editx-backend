import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function trimAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`TrimAgent started for session: ${sessionId}`);

    const inputPath = path.join('temp', sessionId, 'fx', 'fx_clip_01.mp4');
    const outputDir = path.join('temp', sessionId, 'trim');
    const outputPath = path.join(outputDir, 'trim_clip_01.mp4');

    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      console.error(`❌ TrimAgent could not create trim folder: ${err.message}`);
      return reject(err);
    }

    // Simple placeholder trim: volume boost + re-encode only
    const command = `ffmpeg -i "${inputPath}" -vf "select=not(mod(n\\,1)),setpts=N/FRAME_RATE/TB" -af "volume=1.0" "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ TrimAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ TrimAgent stderr: ${stderr}`);
      }

      console.log(`✅ TrimAgent completed for session: ${sessionId}`);
      resolve({
        status: "success",
        outputFiles: [outputPath]
      });
    });
  });
}
