import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ChatBox from "./components/ChatBox.jsx";
import { askQuestion } from "./api";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createConversation = (label = "New chat") => ({
  id: makeId(),
  title: label,
  messages: [],
});

function ChatApp() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([
    createConversation("Welcome"),
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleNewConversation = () => {
    const fresh = createConversation("New chat");
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  };

  const handleSend = async (text) => {
    if (!text.trim() || !activeConversation) {
      return;
    }

    const userMessage = {
      id: makeId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantMessage = {
      id: makeId(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const history = [...activeConversation.messages, userMessage].map(
      ({ role, content }) => ({ role, content })
    );

    updateConversation(activeConversation.id, (conv) => ({
      ...conv,
      title:
        conv.messages.length === 0
          ? text.slice(0, 42)
          : conv.title,
      messages: [...conv.messages, userMessage, assistantMessage],
    }));

    setIsLoading(true);
    setError("");

    try {
      const reply = await askQuestion({
        question: text.trim(),
        history,
        stream: streamEnabled,
        onToken: (chunk) => {
          updateConversation(activeConversation.id, (conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            ),
          }));
        },
      });

      if (!streamEnabled) {
        updateConversation(activeConversation.id, (conv) => ({
          ...conv,
          messages: conv.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: reply }
              : msg
          ),
        }));
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      updateConversation(activeConversation.id, (conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Sorry, I could not fetch a response.",
              }
            : msg
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleAccount = () => {
    navigate("/login");
  };

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
            <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-3">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-left text-sm font-semibold text-ink"
              >
                Settings
              </button>
            </div>
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3">
                <button
                  type="button"
                  onClick={handleAccount}
                  className="flex items-center gap-3 text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-mist">
                    CS
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">My Account</p>
                    <p className="text-xs text-ink/60">Manage profile</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-ink/20 px-3 py-2 text-xs font-semibold text-ink"
                >
                  Logout
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
                  <h1 className="font-display text-2xl text-ink sm:text-3xl">
                    Ask about civic services
                  </h1>
                </div>
                <p className="text-sm text-ink/60">
                  Powered by retrieval + official application links
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-ink/70">
                <span>Streaming</span>
                <button
                  type="button"
                  className={`h-7 w-12 rounded-full border transition ${
                    streamEnabled
                      ? "border-ink bg-ink"
                      : "border-ink/30 bg-white"
                  }`}
                  onClick={() => setStreamEnabled((prev) => !prev)}
                >
                  <span
                    className={`block h-5 w-5 translate-x-1 rounded-full bg-mist transition ${
                      streamEnabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <ChatBox
                messages={activeConversation?.messages || []}
                onSend={handleSend}
                isLoading={isLoading}
                error={error}
                streamEnabled={streamEnabled}
                onToggleStream={() => setStreamEnabled((prev) => !prev)}
              />
            </div>
          </div>
        </main>
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-ink/50 transition-opacity ${
          isSettingsOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSettingsOpen(false)}
        role="presentation"
      />
      <div
        className={`fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-lg -translate-x-1/2 rounded-3xl bg-white p-6 shadow-glow transition-transform ${
          isSettingsOpen ? "-translate-y-1/2" : "-translate-y-[60%] opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40">
              Settings
            </p>
            <h2 className="font-display text-2xl text-ink">Account preferences</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold text-ink"
          >
            Close
          </button>
        </div>
        <div className="mt-5 space-y-4 text-sm text-ink/70">
          <div className="rounded-2xl border border-ink/10 bg-mist/60 p-4">
            <p className="font-semibold text-ink">Notifications</p>
            <p className="mt-1">Email alerts for replies and application updates.</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-mist/60 p-4">
            <p className="font-semibold text-ink">Language & region</p>
            <p className="mt-1">Set Tamil or English answers and local office info.</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-mist/60 p-4">
            <p className="font-semibold text-ink">Data & privacy</p>
            <p className="mt-1">Manage saved chats and data retention settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
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
