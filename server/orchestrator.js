import fs from 'fs';
import path from 'path';

console.log('🧠 Testing orchestrator module load...');

import fxAgent from './agents/fxAgent.js';
import trimAgent from './agents/trimAgent.js';
import musicAgent from './agents/musicAgent.js';
import narrationAgent from './agents/narrationAgent.js';
import subtitleAgent from './agents/subtitleAgent.js';
import render from './render.js';

console.log('✅ orchestrator module loaded');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function startProcessing(sessionId, context, filePaths = []) {
  console.log(`🎬 Orchestrator activated for session: ${sessionId}`);

  const tempPath = path.join(process.cwd(), 'temp', sessionId);
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
    console.log(`📁 Created temp directory for session: ${tempPath}`);
  }

  try {
    console.log('🎞️ Starting fxAgent...');
    await fxAgent(sessionId, context, OPENAI_API_KEY);

    console.log('✂️ Starting trimAgent...');
    await trimAgent(sessionId, context, OPENAI_API_KEY);

    console.log('🎵 Starting musicAgent...');
    await musicAgent(sessionId, context, OPENAI_API_KEY);

    console.log('🗣️ Starting narrationAgent...');
    await narrationAgent(sessionId, context, OPENAI_API_KEY);

    console.log('💬 Starting subtitleAgent...');
    await subtitleAgent(sessionId, context, OPENAI_API_KEY);

    console.log('✅ All agents completed successfully.');

    console.log('🎥 Starting final render...');
    await render(sessionId);

    console.log(`🎉 Final render completed for session: ${sessionId}`);
  } catch (err) {
    console.error(`❌ Orchestration failed for session ${sessionId}: ${err.message}`);
  }
}
