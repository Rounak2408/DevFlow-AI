import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnv = path.join(__dirname, '..', '..', '.env');
/* Lower-precedence first; repo root .env wins (override) so LLM_PROVIDER / GEMINI_* edits always apply. */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: repoRootEnv, override: true });
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { setupSocket } from './socket/index.js';

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await connectDB(process.env.MONGODB_URI);
  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });
  setupSocket(io);

  server.listen(PORT, () => {
    const llm = (process.env.LLM_PROVIDER || 'openai').trim().toLowerCase();
    console.log(`DevFlow API listening on :${PORT} (assistant LLM: ${llm})`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
