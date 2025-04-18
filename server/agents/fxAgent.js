import fs from 'fs';
import { exec } from 'child_process';

function fxAgent(sessionId) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    const sessionDir = `uploads/${sessionId}`;
    const fxOutput = `temp/${sessionId}/fx/fx_clip_01.mp4`;

    const files = fs.readdirSync(sessionDir).filter(file => file.endsWith('.mp4'));
    if (files.length === 0) {
      return reject(new Error(`No video files found in ${sessionDir}`));
    }

    const inputPath = `${sessionDir}/${files[0]}`;
    const command = `ffmpeg -i ${inputPath} -vf "eq=contrast=1.5:saturation=1.2" -c:a copy ${fxOutput}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`FXAgent error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.warn(`FXAgent stderr: ${stderr}`);
      console.log(`✅ FXAgent completed for session: ${sessionId}`);
      resolve({ status: "success", outputFiles: [fxOutput] });
    });
  });
}

export default fxAgent;
