// subtitleAgent.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import FormData from 'form-data';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function subtitleAgent(sessionId) {
  console.log(`SubtitleAgent started for session: ${sessionId}`);

  const uploadPath = path.resolve(`uploads/${sessionId}`);
  const videoFile = fs.readdirSync(uploadPath).find(file => file.endsWith('.mp4'));
  const inputPath = path.join(uploadPath, videoFile);
  const audioPath = path.resolve(`temp/${sessionId}/audio.wav`);
  const subtitlePath = path.resolve(`temp/${sessionId}/subtitles/subtitles.srt`);

  // Ensure subtitle folder exists
  fs.mkdirSync(path.dirname(subtitlePath), { recursive: true });

  // Step 1: Extract audio from video
  await new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${audioPath}" -y`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve();
    });
  });

  // Step 2: Send audio to OpenAI Whisper
  const form = new FormData();
  form.append('file', fs.createReadStream(audioPath));
  form.append('model', 'whisper-1');
  form.append('response_format', 'srt');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...form.getHeaders()
    }
  });

  // Step 3: Save the result to a subtitles file
  fs.writeFileSync(subtitlePath, response.data);

  console.log(`✅ Subtitles saved to ${subtitlePath}`);
  return {
    status: 'success',
    outputFiles: [subtitlePath]
  };
}

export default subtitleAgent;
