// fxAgent.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";

function fxAgent(sessionId, context) {
  return new Promise((resolve, reject) => {
    console.log(`FXAgent started for session: ${sessionId}`);

    const sessionFolder = `uploads/${sessionId}`;
    const tempFolder = `temp/${sessionId}/fx`;
    fs.mkdirSync(tempFolder, { recursive: true });

    const inputFile = fs
      .readdirSync(sessionFolder)
      .find((file) => file.endsWith(".mp4"));
    if (!inputFile) return reject("No .mp4 file found in upload folder.");

    const inputPath = path.join(sessionFolder, inputFile);
    const compressedPath = path.join(tempFolder, "compressed.mp4");
    const outputPath = path.join(tempFolder, "fx_clip_01.mp4");

    const compressCmd = `ffmpeg -i "${inputPath}" -vf "scale=720:-2" -preset fast -crf 28 -c:a copy "${compressedPath}"`;
    const fxCmd = `ffmpeg -i "${compressedPath}" -vf "eq=contrast=1.5:saturation=1.2" -c:a copy "${outputPath}"`;

    // Step 1: Compress the video before FX
    exec(compressCmd, (compressErr, _, compressStderr) => {
      if (compressErr) {
        console.error("Compression error:", compressStderr);
        return reject(compressErr);
      }

      // Step 2: Apply visual FX
      exec(fxCmd, (fxErr, stdout, fxStderr) => {
        if (fxErr) {
          console.error("FX command failed:", fxStderr);
          return reject(fxErr);
        }
        console.log("FXAgent complete:", stdout);
        resolve({ status: "success", output: outputPath });
      });
    });
  });
}

export default fxAgent;
