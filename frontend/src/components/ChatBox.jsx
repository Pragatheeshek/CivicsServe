import { useEffect, useRef, useState } from "react";
import Message from "./Message.jsx";

export default function ChatBox({
  messages,
  onSend,
  isLoading,
  error,
}) {
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="flex h-[65vh] flex-col sm:h-[70vh]">
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink/10 bg-white/50 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-ink/60">
            Ask your question about Tamil Nadu civic services.
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="text-xs uppercase tracking-widest text-ink/40">
            Thinking...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-xs uppercase tracking-widest text-ink/40">
            Your question
          </label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Type your question"
            className="mt-2 w-full resize-none rounded-2xl border border-ink/20 bg-white/80 px-4 py-3 text-sm focus:border-ink focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-brass px-6 py-3 text-sm font-semibold text-mist shadow-glow transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </div>
      )}
    </div>
  );
}
