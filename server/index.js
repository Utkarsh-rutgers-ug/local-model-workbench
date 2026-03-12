import express from 'express';
import cors from 'cors';
import { listModels, chatStream } from './ollama.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/models - list locally available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const models = await listModels();
    res.json(models);
  } catch (err) {
    console.error('Failed to fetch models from Ollama:', err.message);
    res.status(500).json({ error: 'Failed to fetch models from Ollama' });
  }
});

// POST /api/chat - stream a chat completion
app.post('/api/chat', async (req, res) => {
  const { model, messages } = req.body;

  if (!model || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'model and messages are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await chatStream(model, messages, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating a response' })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
