import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function subtitleAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`SubtitleAgent started for session: ${sessionId}`);

    const inputPath = path.join('uploads', sessionId, 'IMG_6296.mp4');
    const outputDir = path.join('temp', sessionId, 'subtitles');
    const outputPath = path.join(outputDir, 'subtitles.ass');

    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      console.error(`❌ Could not create subtitle folder: ${err.message}`);
      return reject(err);
    }

    const command = `whisper --model base --output_format ass --output_dir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ SubtitleAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ SubtitleAgent stderr: ${stderr}`);
      }

      console.log(`✅ SubtitleAgent completed for session: ${sessionId}`);
      resolve({
        status: "success",
        outputFiles: [outputPath]
      });
    });
  });
}
