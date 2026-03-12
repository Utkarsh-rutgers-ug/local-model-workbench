import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchModels() {
      try {
        const res = await fetch(`${API_BASE}/api/models`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setModels(data);
          if (data.length > 0) onModelChange(data[0]);
        }
      } catch (err) {
        if (!cancelled) setError('Could not load models');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchModels();
    return () => { cancelled = true; };
  }, [onModelChange]);

  if (loading) return <span className="model-selector">Loading models…</span>;
  if (error) return <span className="model-selector" style={{ color: '#e94560' }}>{error}</span>;
  if (models.length === 0) return <span className="model-selector">No models found</span>;

  return (
    <div className="model-selector">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        aria-label="Select a model"
      >
        {models.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
