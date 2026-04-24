import ChatBubble from "./chat/ChatBubble";

export default function Message({ message }) {
  return <ChatBubble message={message} isTyping={Boolean(message.isTyping)} />;
}
