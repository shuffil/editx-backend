import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

function fxAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    const inputDir = path.join('uploads', sessionId);
    const outputDir = path.join('temp', sessionId, 'fx');
    fs.mkdirSync(outputDir, { recursive: true });

    const inputFiles = fs.readdirSync(inputDir).filter(file => file.endsWith('.mp4'));
    if (inputFiles.length === 0) {
      return reject(new Error('No .mp4 files found in session upload folder.'));
    }

    const inputPath = path.join(inputDir, inputFiles[0]);
    console.log(`🟡 Using input file: ${inputPath}`);

    const compressedPath = path.join(outputDir, 'compressed.mp4');
    const fxPath = path.join(outputDir, 'fx_clip_01.mp4');

    // Step 1: Compress to reduce resource usage
    const compressCommand = `ffmpeg -y -i "${inputPath}" -vf "scale=720:-2" -preset veryfast -crf 28 -c:a copy "${compressedPath}"`;
    console.log(`🔧 Running compression command:\n${compressCommand}`);

    exec(compressCommand, (compressErr, compressStdout, compressStderr) => {
      if (compressErr) {
        console.error(`❌ Compression failed: ${compressErr.message}`);
        return reject(compressErr);
      }
      console.log(`✅ Compression complete: ${compressedPath}`);

      // Step 2: Apply FX
      const fxCommand = `ffmpeg -y -i "${compressedPath}" -vf "eq=contrast=1.5:saturation=1.2" -c:a copy "${fxPath}"`;
      console.log(`🎨 Running FX command:\n${fxCommand}`);

      exec(fxCommand, (fxErr, fxStdout, fxStderr) => {
        if (fxErr) {
          console.error(`❌ FXAgent error: ${fxErr.message}`);
          return reject(fxErr);
        }

        console.log(`✅ FXAgent completed: ${fxPath}`);
        resolve({
          status: 'success',
          outputFiles: [fxPath],
        });
      });
    });
  });
}

export default fxAgent;
