import { useState, useCallback } from 'react';
import ModelSelector from './components/ModelSelector';
import ChatWindow from './components/ChatWindow';
import PromptBox from './components/PromptBox';
import './styles.css';

const API_BASE = 'http://localhost:3001';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = useCallback(
    async (prompt) => {
      if (!selectedModel || !prompt.trim()) return;

      const userMessage = { id: makeId(), role: 'user', content: prompt };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      const assistantId = makeId();
      const assistantMessage = { id: assistantId, role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const token = parsed?.message?.content ?? '';
                if (token) {
                  setMessages((prev) => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    next[lastIdx] = {
                      ...next[lastIdx],
                      content: next[lastIdx].content + token,
                    };
                    return next;
                  });
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          next[lastIdx] = {
            ...next[lastIdx],
            content: `Error: ${err.message}`,
          };
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [selectedModel, messages]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Local Model Workbench</h1>
        <ModelSelector onModelChange={setSelectedModel} selectedModel={selectedModel} />
      </header>
      <main className="app-main">
        <ChatWindow messages={messages} />
      </main>
      <footer className="app-footer">
        <PromptBox onSend={handleSend} disabled={isStreaming || !selectedModel} />
      </footer>
    </div>
  );
}
