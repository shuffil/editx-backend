import fs from 'fs';
import path from 'path';

import fxAgent from './agents/fxAgent.js';
import trimAgent from './agents/trimAgent.js';
import musicAgent from './agents/musicAgent.js';
import narrationAgent from './agents/narrationAgent.js';
import subtitleAgent from './agents/subtitleAgent.js';
import render from './render.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function startProcessing(sessionId, context, filePaths = []) {
  console.log(`🚀 Starting orchestration for session: ${sessionId}`);

  const tempPath = path.join(process.cwd(), 'temp', sessionId);
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }

  try {
    await fxAgent(sessionId, context, OPENAI_API_KEY);
    await trimAgent(sessionId, context, OPENAI_API_KEY);
    await musicAgent(sessionId, context, OPENAI_API_KEY);
    await narrationAgent(sessionId, context, OPENAI_API_KEY);
    await subtitleAgent(sessionId, context, OPENAI_API_KEY);

    console.log('✅ All agents completed successfully.');
    await render(sessionId);
    console.log(`🎉 Final render completed for session: ${sessionId}`);
  } catch (err) {
    console.error(`❌ Orchestration failed: ${err.message}`);
  }
}
