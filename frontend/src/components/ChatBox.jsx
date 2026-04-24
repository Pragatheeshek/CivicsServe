import { useEffect, useRef, useState } from "react";
import Message from "./Message.jsx";
import Button from "./ui/Button";
import Card from "./ui/Card";

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
    <Card className="flex h-[68vh] flex-col p-3 sm:h-[72vh] sm:p-4">
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-river/10 bg-gradient-to-b from-white/85 to-mist/75 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-ink/65">
            <img src="/civicsserve-logo.png" alt="CiviServe AI" className="mb-3 h-16 w-16 object-contain opacity-80" />
            <p className="font-semibold text-ink">Start a conversation with CiviServe AI</p>
            <p className="mt-1 max-w-sm text-xs text-ink/60">Ask about certificates, schemes, municipality services, and official links.</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3">
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask CiviServe AI..."
            className="w-full resize-none rounded-2xl border border-river/20 bg-white/90 px-4 py-3 text-sm text-ink outline-none transition focus:border-river focus:shadow-[0_0_0_4px_rgba(31,106,165,0.12)]"
          />
        </div>
        <Button type="submit" loading={isLoading} className="h-[50px] min-w-[96px] rounded-2xl bg-brass text-mist hover:bg-river">
          Send
        </Button>
      </form>

      {error && (
        <div className="mt-3 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </div>
      )}
    </Card>
  );
}
