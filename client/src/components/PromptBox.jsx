import { useState, useCallback } from 'react';

export default function PromptBox({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="prompt-box">
      <textarea
        rows={2}
        placeholder={disabled ? 'Select a model to start chatting…' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Message input"
      />
      <button onClick={handleSubmit} disabled={disabled || !value.trim()}>
        Send
      </button>
    </div>
  );
}
