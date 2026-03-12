export default function MessageBubble({ role, content }) {
  return (
    <div className={`message-bubble ${role}`}>
      {content}
    </div>
  );
}
