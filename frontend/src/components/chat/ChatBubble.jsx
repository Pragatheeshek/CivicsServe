import React from "react";
import { motion } from "framer-motion";

function sanitizeDisplayText(value) {
  return String(value || "")
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "")
    .replace(/\u001B\][^\u0007]*(\u0007|\u001B\\)/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function normalizeHref(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function renderLineWithLinks(line, linkClassName) {
  const text = sanitizeDisplayText(line);
  const parts = [];
  const combinedPattern = /(\[[^\]]+\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<>"]*[^\s<>",.;:!?\])])/gi;
  let lastIndex = 0;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      const markdownTextMatch = match[1].match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/i);
      const label = markdownTextMatch ? markdownTextMatch[1] : match[2];
      const href = normalizeHref(match[2]);

      parts.push(
        <a
          key={`md-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`chat-link ${linkClassName}`}
          title={href}
        >
          {label}
        </a>
      );
    } else if (match[3]) {
      const href = normalizeHref(match[3]);
      parts.push(
        <a
          key={`url-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`chat-link ${linkClassName}`}
          title={href}
        >
          {match[3]}
        </a>
      );
    }

    lastIndex = combinedPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function ChatBubble({ message, isTyping = false }) {
  const isAssistant = message.role === "assistant";
  const lines = sanitizeDisplayText(message.content || "").split(/\r?\n/);
  const linkClassName = isAssistant ? "assistant-link" : "user-link";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message-enter flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[78%] ${
          isAssistant ? "bg-white text-ink" : "bg-ink text-mist"
        }`}
      >
        {isTyping && !message.content ? (
          <div className="inline-flex items-center gap-1 px-1 py-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : (
          <p className="leading-relaxed">
            {lines.map((line, index) => (
              <React.Fragment key={`line-${index}`}>
                {renderLineWithLinks(line, linkClassName)}
                {index < lines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </motion.div>
  );
}
