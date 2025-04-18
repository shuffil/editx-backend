import { exec } from 'child_process';

const fs = require('fs');
const path = require('path');

function render(sessionId) {
  return new Promise((resolve, reject) => {
    console.log(`Render started for session: ${sessionId}`);

    const sessionDir = path.join(__dirname, '../temp', sessionId, 'trim');
    const audioDir = path.join(__dirname, '../temp', sessionId, 'audio');
    const subtitlesPath = path.join(__dirname, '../temp', sessionId, 'subtitles', 'subtitles.ass');
    const outputPath = path.join(__dirname, '../exports', `${sessionId}.mp4`);
    const concatListPath = path.join(__dirname, '../temp', sessionId, 'concat.txt');

    // Step 1: Generate concat.txt
    const files = fs.readdirSync(sessionDir)
      .filter(file => file.endsWith('.mp4'))
      .map(file => `file '${path.join(sessionDir, file)}'`)
      .join('\n');

    fs.writeFileSync(concatListPath, files);

    // Step 2: Build FFmpeg command
    const command = `ffmpeg -f concat -safe 0 -i "${concatListPath}" \
-i "${audioDir}/music.mp3" -i "${audioDir}/narration.mp3" \
-vf "ass='${subtitlesPath}',scale=1280:720" \
-filter_complex "[0:v][1:a][2:a]amix=inputs=2[a]" \
-map 0:v -map "[a]" -c:v libx264 -c:a aac -strict experimental "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Render error: ${error.message}`);
        return reject(error);
      }
      console.log(`✅ Render completed for session: ${sessionId}`);
      resolve(outputPath);
    });
  });
}

export default render;
