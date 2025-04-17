import fs from 'fs';
import path from 'path';

// Agent imports
import fxAgent from './agents/fxAgent.js';
import trimAgent from './agents/trimAgent.js';
import musicAgent from './agents/musicAgent.js';
import narrationAgent from './agents/narrationAgent.js';
import subtitleAgent from './agents/subtitleAgent.js';
import render from './render.js'; // ✅ direct render function

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export function startProcessing(sessionId, context, filePaths = []) {
  console.log(`🚀 Starting orchestration for session: ${sessionId}`);

  const sessionPath = path.join(process.cwd(), 'uploads', sessionId);
  const tempPath = path.join(process.cwd(), 'temp', sessionId);

  // Ensure temp directory exists
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }

  // Run agents sequentially
  fxAgent(sessionId, context, OPENAI_API_KEY)
    .then(() => trimAgent(sessionId, context, OPENAI_API_KEY))
    .then(() => musicAgent(sessionId, context, OPENAI_API_KEY))
    .then(() => narrationAgent(sessionId, context, OPENAI_API_KEY))
    .then(() => subtitleAgent(sessionId, context, OPENAI_API_KEY))
    .then(() => {
      console.log('✅ All agents completed successfully. Starting final render...');
      return render(sessionId); // ✅ calls render function directly
    })
    .then(() => {
      console.log(`🎉 Final render completed for session: ${sessionId}`);
    })
    .catch((error) => {
      console.error(`❌ Orchestration error: ${error.message}`);
    });
}
