# local-model-workbench

A local AI workbench for chatting with local LLMs through [Ollama](https://ollama.ai).

## Project Structure

```
local-model-workbench/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ ChatWindow.jsx       # Scrollable message list
│  │  │  ├─ MessageBubble.jsx    # Individual chat message
│  │  │  ├─ ModelSelector.jsx    # Dropdown to pick an Ollama model
│  │  │  └─ PromptBox.jsx        # Text input + send button
│  │  ├─ App.jsx                 # Root component & chat logic
│  │  ├─ main.jsx                # React entry point
│  │  └─ styles.css              # Global style
│  └─ package.json
├─ server/
│  ├─ index.js                   # Express API server
│  ├─ ollama.js                  # Ollama API helpers
│  └─ package.json
├─ .gitignore
├─ README.md
└─ package.json
```

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Ollama](https://ollama.ai) running locally (`ollama serve`)

## Getting Started

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both the server (port 3001) and the client (port 5173) concurrently
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/models` | List locally available Ollama models |
| POST | `/api/chat` | Stream a chat completion (SSE) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | Base URL for the Ollama server |
| `PORT` | `3001` | Port the Express server listens on |

License may evolve as the project grows.
