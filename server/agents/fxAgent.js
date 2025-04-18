import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default function fxAgent(sessionId, context, files) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    const sessionFolder = `uploads/${sessionId}`;
    const tempFolder = `temp/${sessionId}/fx`;
    fs.mkdirSync(tempFolder, { recursive: true });

    const firstFile = files?.[0]?.originalname || 'input.mp4';
    const inputPath = path.join(sessionFolder, firstFile);
    const outputPath = path.join(tempFolder, 'fx_clip_01.mp4');

    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${outputPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ FXAgent stderr: ${stderr}`);
      }
      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve({
        status: 'success',
        outputFiles: [outputPath],
      });
    });
  });
}
