import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default function fxAgent(sessionId) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);
    
    const inputPath = `uploads/${sessionId}/IMG_6294.mp4`; // or dynamically select
    const outputDir = `temp/${sessionId}/fx`;
    const outputPath = `${outputDir}/fx_clip_01.mp4`;

    // ✅ Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${outputPath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.warn(`FXAgent stderr: ${stderr}`);
      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve({ status: "success", outputFiles: [outputPath] });
    });
  });
}
