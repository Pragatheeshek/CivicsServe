import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ChatBox from "./components/ChatBox.jsx";
import {
  askQuestion,
  clearAuthSession,
  getCurrentUser,
  getUserChatHistory,
  saveUserChatHistory,
} from "./api";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img
          src="/civicsserve-logo.png"
          alt="CivicsServe logo"
          className="splash-logo"
        />
        <h1 className="splash-title">CivicsServe</h1>
        <p className="splash-subtitle">Tamil Nadu Citizen Assistant</p>
      </div>
    </div>
  );
}

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createConversation = (label = "New chat") => ({
  id: makeId(),
  title: label,
  messages: [],
});

const TYPE_DELAY_MS = 14;
const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function ChatApp() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getCurrentUser());
  const isGuest = !currentUser?.id;
  const [conversations, setConversations] = useState([
    createConversation("Welcome"),
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const loadUserChat = async () => {
      try {
        const result = await getUserChatHistory({ userId: currentUser.id });
        const savedMessages = Array.isArray(result?.messages)
          ? result.messages.map((msg) => ({
              id: makeId(),
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp || new Date().toISOString(),
            }))
          : [];

        if (savedMessages.length > 0) {
          const restored = createConversation("Saved chat");
          restored.messages = savedMessages;
          setConversations([restored]);
          setActiveId(restored.id);
        }
      } catch {
        // Keep default chat state if history load fails.
      }
    };

    loadUserChat();
  }, [currentUser]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeId),
    [conversations, activeId]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return conversations;
    }
    return conversations.filter((conv) => {
      const titleMatch = conv.title.toLowerCase().includes(query);
      const messageMatch = conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );
      return titleMatch || messageMatch;
    });
  }, [conversations, searchQuery]);

  const updateConversation = (id, updater) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? updater(conv) : conv))
    );
  };

  const typeAssistantReply = async (conversationId, messageId, fullText) => {
    const safeText = String(fullText || "");

    for (let index = 0; index < safeText.length; index += 1) {
      const nextChunk = safeText.slice(0, index + 1);
      updateConversation(conversationId, (conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: nextChunk, isTyping: true }
            : msg
        ),
      }));
      // Small delay makes output feel natural instead of instant dump.
      await sleep(TYPE_DELAY_MS);
    }

    updateConversation(conversationId, (conv) => ({
      ...conv,
      messages: conv.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: safeText, isTyping: false }
          : msg
      ),
    }));
  };

  const handleNewConversation = () => {
    const fresh = createConversation("New chat");
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  };

  const handleSend = async (text) => {
    if (!text.trim() || !activeConversation) {
      return;
    }

    const conversationId = activeConversation.id;
    const existingMessages = activeConversation.messages;
    const normalizedText = text.trim();

    const userMessage = {
      id: makeId(),
      role: "user",
      content: normalizedText,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage = {
      id: makeId(),
      role: "assistant",
      content: "",
      isTyping: true,
      timestamp: new Date().toISOString(),
    };

    const history = [...existingMessages, userMessage].map(
      ({ role, content }) => ({ role, content })
    );

    updateConversation(conversationId, (conv) => ({
      ...conv,
      title:
        conv.messages.length === 0
          ? normalizedText.slice(0, 42)
          : conv.title,
      messages: [...conv.messages, userMessage, assistantMessage],
    }));

    setIsLoading(true);
    setError("");

    try {
      const reply = await askQuestion({
        question: normalizedText,
        history,
        stream: false,
      });

      const finalReply = String(reply || "").trim() || "Sorry, I could not fetch a response.";
      await typeAssistantReply(conversationId, assistantMessage.id, finalReply);

      const finalMessages = [
        ...existingMessages,
        userMessage,
        { ...assistantMessage, content: finalReply, isTyping: false },
      ];

      if (currentUser?.id) {
        await saveUserChatHistory({
          userId: currentUser.id,
          messages: finalMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        });
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      const fallback = "Sorry, I could not fetch a response.";
      await typeAssistantReply(conversationId, assistantMessage.id, fallback);

      const failedMessages = [
        ...existingMessages,
        userMessage,
        { ...assistantMessage, content: fallback, isTyping: false },
      ];

      if (currentUser?.id) {
        try {
          await saveUserChatHistory({
            userId: currentUser.id,
            messages: failedMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            })),
          });
        } catch {
          // Ignore chat save failures here.
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (isGuest) {
      navigate("/");
      return;
    }

    clearAuthSession();
    navigate("/login");
  };

  const handleAccount = () => {
    if (isGuest) {
      navigate("/login");
      return;
    }

    navigate("/app");
  };

  const initials = (isGuest ? "G" : currentUser.name || "CS")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-inkwash px-4 py-6 sm:px-6 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <div
          className={`fixed inset-0 z-40 bg-ink/40 transition-opacity lg:hidden ${
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          role="presentation"
        />
        <aside
          className={`surface-card fixed left-4 top-6 z-50 h-[calc(100vh-3rem)] w-[86vw] max-w-xs overflow-y-auto rounded-3xl p-5 shadow-glow transition-transform lg:static lg:z-auto lg:h-[calc(100vh-3rem)] lg:w-72 lg:translate-x-0 lg:overflow-visible lg:rounded-3xl lg:p-5 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
          } lg:sticky lg:top-6`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <p className="text-sm font-semibold text-ink">Menu</p>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
              >
                Close
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-ink">Conversations</p>
                <p className="text-sm text-ink/60">CivicsServe</p>
              </div>
              <button
                className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-mist transition hover:translate-y-[-1px]"
                onClick={handleNewConversation}
                type="button"
              >
                + New
              </button>
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Search chats
              </label>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="Search conversations"
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white/80 px-4 py-2 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <div className="mt-4 space-y-3">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setActiveId(conv.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    conv.id === activeId
                      ? "border-ink bg-ink text-mist"
                      : "border-transparent bg-white/50 text-ink hover:border-ink/40"
                  }`}
                >
                  <p className="truncate font-semibold">
                    {conv.title || "New chat"}
                  </p>
                  <p className="mt-1 text-xs opacity-70">
                    {conv.messages.length} messages
                  </p>
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-xs text-ink/60">
                  No conversations match your search.
                </div>
              )}
            </div>
            <div className="mt-auto pt-4">
              <div className="rounded-2xl border border-ink/10 bg-white/60 p-3">
                <button
                  type="button"
                  onClick={handleAccount}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-mist">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {isGuest ? "Guest User" : currentUser.name || "My Account"}
                    </p>
                    <p
                      className="truncate text-xs text-ink/60"
                      title={isGuest ? "Login to save chat history" : currentUser.email || "Manage profile"}
                    >
                      {isGuest ? "Login to save chat history" : currentUser.email || "Manage profile"}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-mist"
                >
                  {isGuest ? "Back to Home" : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="surface-card rounded-3xl p-5 shadow-glow sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white/80 text-sm font-semibold text-ink lg:hidden"
                  >
                    ≡
                  </button>
                  <img
                    src="/civicsserve-logo.png"
                    alt="CiviServe AI"
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  />
                  <h1 className="font-display text-2xl text-ink sm:text-3xl">
                    Ask about civic services
                  </h1>
                </div>
                <p className="text-sm text-ink/60">
                  Powered by retrieval + official application links
                </p>
              </div>
            </div>

            <div className="mt-6">
              <ChatBox
                messages={activeConversation?.messages || []}
                onSend={handleSend}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<ChatApp />} />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
