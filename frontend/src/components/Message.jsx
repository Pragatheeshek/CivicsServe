export default function Message({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`message-enter flex ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isAssistant
            ? "bg-white text-ink"
            : "bg-ink text-mist"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
