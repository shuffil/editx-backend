import path from 'path';
import { exec } from 'child_process';

export default function fxAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    // Safe path construction
    const inputPath = path.join('uploads', sessionId, 'IMG_6296.mp4');
    const outputDir = path.join('temp', sessionId, 'fx');
    const outputPath = path.join(outputDir, 'fx_clip_01.mp4');

    // Ensure temp/fx directory exists
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      console.error(`❌ FXAgent could not create fx folder: ${err.message}`);
      return reject(err);
    }

    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${outputPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ FXAgent stderr: ${stderr}`);
      }

      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve({
        status: "success",
        outputFiles: [outputPath]
      });
    });
  });
}
