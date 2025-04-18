import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function musicAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`MusicAgent started for session: ${sessionId}`);

    const outputDir = path.join('temp', sessionId, 'audio');
    const outputPath = path.join(outputDir, 'music.mp3');

    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      console.error(`❌ MusicAgent could not create audio folder: ${err.message}`);
      return reject(err);
    }

    // FFmpeg command to generate a sine wave and export it as music.mp3
    const command = `ffmpeg -f lavfi -i "sine=frequency=1000:duration=5" -c:a libmp3lame "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ MusicAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ MusicAgent stderr: ${stderr}`);
      }

      console.log(`✅ MusicAgent completed for session: ${sessionId}`);
      resolve({
        status: "success",
        outputFiles: [outputPath]
      });
    });
  });
}
