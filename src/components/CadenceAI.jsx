import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  Copy,
  Loader2,
  PanelLeft,
  Plus,
  RotateCcw,
  Search,
  Share,
  Square,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api.js";

const CACHE_KEY = "cynai-chats-cache-v1";
const LEGACY_CACHE_KEY = "study-companion-chats-cache-v1";

const THINKING_STATUSES = [
  "Thinking…",
  "Reflecting…",
  "Considering…",
  "Pondering…",
  "Working through it…",
  "Connecting the dots…",
  "Checking the syllabus…",
  "Gathering examples…",
  "Structuring the answer…",
  "Reviewing key concepts…",
  "Almost there…",
];

function loadCachedConversations() {
  try {
    const raw = localStorage.getItem(CACHE_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((c) => c && typeof c.id === "string" && Array.isArray(c.messages));
  } catch {
    return null;
  }
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-academic-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-academic-gold-dark"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={key}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-academic-navy-dark">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function AssistantBody({ content }) {
  const segments = useMemo(() => {
    const out = [];
    const regex = /```(\w*)\n?([\s\S]*?)```/g;
    let last = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > last) out.push({ type: "text", text: content.slice(last, match.index) });
      out.push({ type: "code", language: match[1], code: match[2].replace(/\n$/, "") });
      last = match.index + match[0].length;
    }
    if (last < content.length) out.push({ type: "text", text: content.slice(last) });
    if (out.length === 0) out.push({ type: "text", text: content });
    return out;
  }, [content]);

  return (
    <div
      className="max-w-none text-[15px] leading-[1.75] text-academic-text"
     
    >
      {segments.map((segment, segIndex) => {
        if (segment.type === "code") {
          return <CodeBlock key={segIndex} language={segment.language} code={segment.code} />;
        }
        const blocks = [];
        let list = null;
        const lines = segment.text.split("\n");
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (/^\|.*\|$/.test(trimmed) && trimmed.includes("|")) {
            if (list) {
              blocks.push(list);
              list = null;
            }
            blocks.push({ type: "table-row", text: trimmed });
            return;
          }
          const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
          if (heading) {
            if (list) {
              blocks.push(list);
              list = null;
            }
            blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
            return;
          }
          const ordered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
          const bullet = trimmed.match(/^([-*])\s+(.*)$/);
          if (ordered || bullet) {
            const item = ordered ? ordered[2] : bullet[2];
            const orderedList = Boolean(ordered);
            if (!list || list.ordered !== orderedList) {
              if (list) blocks.push(list);
              list = { type: "list", ordered: orderedList, items: [] };
            }
            list.items.push(item);
            return;
          }
          if (trimmed === "") {
            if (list) {
              blocks.push(list);
              list = null;
            }
            return;
          }
          if (list) {
            blocks.push(list);
            list = null;
          }
          blocks.push({ type: "paragraph", text: line });
        });
        if (list) blocks.push(list);

        return (
          <div key={segIndex}>
            {blocks.map((block, index) => {
              const key = `${segIndex}-${index}`;
              if (block.type === "heading") {
                return (
                  <p key={key} className={`mb-1 mt-4 font-semibold text-academic-navy ${block.level <= 2 ? "text-[17px]" : "text-[15.5px]"}`}>
                    {renderInline(block.text, key)}
                  </p>
                );
              }
              if (block.type === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag
                    key={key}
                    className={`mt-3 space-y-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"} marker:text-academic-text-muted`}
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{renderInline(item, `${key}-li-${itemIndex}`)}</li>
                    ))}
                  </ListTag>
                );
              }
              if (block.type === "table-row") {
                return (
                  <p key={key} className="mt-2 overflow-x-auto font-mono text-[13px] text-academic-text-secondary">
                    {block.text}
                  </p>
                );
              }
              return (
                <p key={key} className={index === 0 ? "" : "mt-4"}>
                  {renderInline(block.text, key)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function blankConversation() {
  return {
    id: `local-${Date.now()}`,
    title: "New study session",
    subject: "",
    createdAt: Date.now(),
    messages: [],
    messageCount: 0,
    messagesLoaded: true,
    loadFailed: false,
    local: true,
  };
}

function toClientConversation(session) {
  const hasMessages = Array.isArray(session.messages);
  const messages = hasMessages
    ? session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))
    : [];
  const messageCount =
    typeof session.messageCount === "number" ? session.messageCount : messages.length;
  return {
    id: session.id,
    title: session.title || "New study session",
    subject: session.subject || "",
    createdAt: session.createdAt,
    messages,
    messageCount,
    // List responses carry no messages — bodies load lazily per session.
    // A session known to be empty needs no fetch at all.
    messagesLoaded: hasMessages || messageCount === 0,
    loadFailed: false,
  };
}

// Merge server truth with optimistic local messages (no id yet).
// A local message whose role+content already exists on the server is dropped.
function mergeMessages(localMessages, serverMessages) {
  const pending = (localMessages || []).filter(
    (m) =>
      !m.id &&
      !serverMessages.some((s) => s.role === m.role && s.content === m.content)
  );
  return [...serverMessages, ...pending];
}

function CadenceAI({ user }) {
  const [conversations, setConversations] = useState(() => {
    const cached = loadCachedConversations();
    if (cached && cached.length > 0) {
      // Cached bodies are valid to display instantly; empty ones need no fetch.
      return cached.map((c) => ({
        ...c,
        messageCount:
          typeof c.messageCount === "number" ? c.messageCount : (c.messages?.length ?? 0),
        messagesLoaded: (c.messages?.length ?? 0) > 0,
        loadFailed: false,
      }));
    }
    return [blankConversation()];
  });
  const [activeId, setActiveId] = useState(() => {
    const cached = loadCachedConversations();
    return cached && cached.length > 0 ? cached[0].id : null;
  });
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [input, setInput] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      return q ? decodeURIComponent(q) : "";
    } catch {
      return "";
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState(THINKING_STATUSES[0]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [shareState, setShareState] = useState("idle");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const threadRef = useRef(null);
  const composerRef = useRef(null);
  const abortRef = useRef(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const displayUser = user || readStoredUser();
  const userInitial = (displayUser?.name || "S").trim().charAt(0).toUpperCase() || "S";
  const userLabel = displayUser?.name || "Student";
  const userSub = displayUser?.usn || displayUser?.role || "VTU CSE";

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? conversations[0],
    [activeId, conversations]
  );

  const getAuthToken = () => localStorage.getItem("authToken") || "";

  const authHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // Load sessions stored under this user's id; fall back to cached copy offline
  useEffect(() => {
    let cancelled = false;
    async function fetchSessions() {
      const token = getAuthToken();
      if (!token) {
        setIsLoadingSessions(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/cynai/sessions`, {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error(`Sessions request failed (${response.status})`);
        const data = await response.json();
        const sessions = (data.sessions || []).map(toClientConversation);
        if (cancelled) return;
        if (sessions.length > 0) {
          setConversations(sessions);
          setActiveId((current) =>
            sessions.some((s) => s.id === current) ? current : sessions[0].id
          );
        } else {
          const created = await fetch(`${API_BASE_URL}/cynai/sessions`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ title: "New study session" }),
          }).then((r) => r.json());
          if (cancelled) return;
          if (created.session) {
            const mapped = toClientConversation(created.session);
            setConversations([mapped]);
            setActiveId(mapped.id);
          }
        }
      } catch {
        // offline — keep cached conversations
      } finally {
        if (!cancelled) setIsLoadingSessions(false);
      }
    }
    fetchSessions();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(conversations.filter((c) => !c.local).slice(0, 30))
      );
    } catch {
      // storage full or unavailable — chat still works in memory
    }
  }, [conversations]);

  useEffect(() => {
    // Scroll only the chat thread container — scrollIntoView would also
    // scroll the page (navbar/footer), making the whole UI jump up on send.
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages, isLoading]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = "auto";
    composer.style.height = `${Math.min(composer.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Rotate Claude-style status lines while a response streams in.
  useEffect(() => {
    if (!isLoading) return;
    setThinkingStatus(THINKING_STATUSES[0]);
    const timer = setInterval(() => {
      setThinkingStatus((previous) => {
        const others = THINKING_STATUSES.filter((s) => s !== previous);
        return others[Math.floor(Math.random() * others.length)];
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [isLoading]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.messages.some((m) => (m.content || "").toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const loadingSessionRef = useRef(new Set());

  const syncSessionFromServer = async (id) => {
    if (!id || String(id).startsWith("local-") || loadingSessionRef.current.has(id)) {
      return;
    }
    loadingSessionRef.current.add(id);
    try {
      const response = await fetch(`${API_BASE_URL}/cynai/sessions/${id}`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(`Session fetch failed (${response.status})`);
      const data = await response.json();
      if (!data.session) throw new Error("Session payload empty");
      const full = toClientConversation(data.session);
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === full.id
            ? {
                ...full,
                messagesLoaded: true,
                loadFailed: false,
                messages: mergeMessages(conversation.messages, full.messages),
              }
            : conversation
        )
      );
    } catch {
      // Never leave the thread stuck on "Loading conversation…" — show what
      // we have (possibly empty) and allow retry from the sidebar.
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === id
            ? { ...conversation, messagesLoaded: true, loadFailed: true }
            : conversation
        )
      );
    } finally {
      loadingSessionRef.current.delete(id);
    }
  };

  // Lazily load message bodies for the active session (the list carries none).
  // isLoadingSessions is a dep on purpose: on refresh the session list
  // replaces the cached objects while activeId stays the same, so without
  // it the effect would never refire and the thread would spin forever.
  useEffect(() => {
    const conversation = conversations.find((c) => c.id === activeId);
    if (!conversation || conversation.local || conversation.messagesLoaded) {
      return;
    }
    if (!getAuthToken()) {
      // Logged out — nothing to fetch; show the empty UI, not a skeleton.
      setConversations((previous) =>
        previous.map((c) => (c.id === conversation.id ? { ...c, messagesLoaded: true } : c))
      );
      return;
    }
    syncSessionFromServer(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, isLoadingSessions]);

  const handleSelect = (id) => {
    setActiveId(id);
    setMobileSidebarOpen(false);
    const conversation = conversations.find((c) => c.id === id);
    if (conversation && !conversation.local && conversation.loadFailed) {
      setConversations((previous) =>
        previous.map((c) =>
          c.id === id ? { ...c, loadFailed: false, messagesLoaded: false } : c
        )
      );
      syncSessionFromServer(id);
    }
  };

  const updateActiveMessages = (updater, targetId) => {
    const id = targetId ?? activeIdRef.current;
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, messages: updater(conversation.messages) }
          : conversation
      )
    );
  };

  const handleNewChat = () => {
    setError("");
    setMobileSidebarOpen(false);
    // Show the new session instantly; persist to the DB in the background.
    const temp = blankConversation();
    setConversations((previous) => [temp, ...previous]);
    setActiveId(temp.id);
    activeIdRef.current = temp.id;
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cynai/sessions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ title: "New study session", subject: "" }),
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!data.session) return;
        const mapped = { ...toClientConversation(data.session), messagesLoaded: true };
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === temp.id
              ? { ...mapped, messages: mergeMessages(conversation.messages, mapped.messages) }
              : conversation
          )
        );
        if (activeIdRef.current === temp.id) {
          activeIdRef.current = mapped.id;
          setActiveId(mapped.id);
        }
      } catch {
        // stays local-only until the next send, which creates the DB session
      }
    })();
  };

  const handleDelete = async (id) => {
    const target = conversations.find((c) => c.id === id);
    const remainingCount = conversations.filter((c) => c.id !== id).length;
    setConversations((previous) => {
      const remaining = previous.filter((c) => c.id !== id);
      if (id === activeIdRef.current) {
        const nextId = remaining[0]?.id ?? null;
        activeIdRef.current = nextId;
        setActiveId(nextId);
      }
      return remaining;
    });
    if (target && !target.local && !String(id).startsWith("local-")) {
      try {
        await fetch(`${API_BASE_URL}/cynai/sessions/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
      } catch {
        // already removed locally
      }
    }
    if (remainingCount === 0) handleNewChat();
  };

  const handleStop = () => abortRef.current?.abort();

  const sendMessage = async (rawText) => {
    const userMessage = (rawText ?? input).trim();
    if (!userMessage || isLoading || !activeConversation) return;

    const history = activeConversation.messages.filter(
      (message) => (message.role === "user" || message.role === "assistant") && message.content
    );
    setInput("");
    setError("");
    const stampedUser = { role: "user", content: userMessage, createdAt: Date.now() };
    updateActiveMessages((messages) => [...messages, stampedUser]);
    setIsLoading(true);

    if (activeConversation.messages.filter((m) => m.role === "user").length === 0) {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                title: userMessage.slice(0, 52) || "New study session",
              }
            : conversation
        )
      );
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const isLocalSession = activeConversation.local || String(activeId).startsWith("local-");
      const response = await fetch(`${API_BASE_URL}/cynai/chat`, {
        method: "POST",
        headers: authHeaders(),
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage,
          sessionId: isLocalSession ? undefined : activeId,
          title: userMessage.slice(0, 52),
          history: history.map((message) => ({ role: message.role, content: message.content })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Request failed (${response.status}). Please try again.`);
      }

      // Adopt the server session id (chat creates/persists the session under the user)
      const serverSessionId = response.headers.get("X-Cynai-Session-Id");
      let streamConversationId = activeIdRef.current;
      if (serverSessionId && serverSessionId !== activeIdRef.current) {
        streamConversationId = serverSessionId;
        const previousId = activeIdRef.current;
        activeIdRef.current = serverSessionId;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === previousId
              ? { ...c, id: serverSessionId, local: false }
              : c
          )
        );
        setActiveId(serverSessionId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming is not supported in this browser.");
      const decoder = new TextDecoder();
      let assistantContent = "";
      updateActiveMessages(
        (messages) => [...messages, { role: "assistant", content: "", createdAt: Date.now() }],
        streamConversationId
      );
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const snapshot = assistantContent;
        updateActiveMessages((messages) => {
          const updated = [...messages];
          updated[updated.length - 1] = {
            role: "assistant",
            content: snapshot,
            createdAt: Date.now(),
          };
          return updated;
        }, streamConversationId);
      }
      if (!assistantContent.trim()) {
        throw new Error("Received an empty response. Please try again.");
      }
      // Reconcile with DB truth in the background (ids, server-side title).
      syncSessionFromServer(streamConversationId);
    } catch (err) {
      if (err?.name === "AbortError") {
        updateActiveMessages((messages) => {
          const last = messages[messages.length - 1];
          if (last?.role === "assistant" && !last.content) return messages.slice(0, -1);
          return messages;
        });
      } else {
        const message = err?.message || "Unable to connect to CadenceAI.";
        setError(message);
        updateActiveMessages((messages) => [
          ...messages,
          { role: "assistant", content: `Sorry — ${message}`, error: true, createdAt: Date.now() },
        ]);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleRetry = () => {
    const lastUser = [...(activeConversation?.messages || [])].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                messages: conversation.messages.filter((m) => !m.error),
              }
            : conversation
        )
      );
      sendMessage(lastUser.content);
    }
  };

  const handleCopyMessage = async (key, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const handleShare = async () => {
    if (!activeConversation) return;
    const transcript = activeConversation.messages
      .map((m) => `${m.role === "user" ? "Student" : "CadenceAI"}: ${m.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`${activeConversation.title}\n\n${transcript}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 1500);
    } catch {
      setShareState("failed");
      setTimeout(() => setShareState("idle"), 1500);
    }
  };

  const isLoadingThread =
    Boolean(activeConversation) &&
    !activeConversation.local &&
    !activeConversation.messagesLoaded;

  const showLoadError =
    Boolean(activeConversation) &&
    activeConversation.loadFailed &&
    activeConversation.messages.length === 0;

  const showEmptyState =
    !isLoadingThread &&
    !showLoadError &&
    (!activeConversation ||
      (activeConversation.messages.length <= 1 &&
        !activeConversation.messages.some((m) => m.role === "user")));

  return (
    <div className="bg-academic-bg text-academic-text">
      <div className="relative flex h-[calc(100dvh-64px)] min-h-[640px] overflow-hidden">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close chats"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 z-30 bg-academic-navy-dark/50 lg:hidden"
          />
        )}

        {/* Left rail */}
        <aside
          className={`z-40 flex w-[248px] shrink-0 flex-col border-r border-academic-border bg-white px-3 pb-3 pt-4 transition-[margin,transform] duration-200 max-lg:absolute max-lg:inset-y-0 max-lg:left-0 ${
            mobileSidebarOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
          } ${sidebarOpen ? "lg:ml-0" : "lg:-ml-[248px]"}`}
        >
          <h1
            className="px-2 text-xl font-bold tracking-tight text-academic-navy"
           
          >
            CadenceAI
          </h1>
          <p className="mt-1 flex items-center gap-1.5 px-2 text-[12px] text-academic-text-muted">
            <BookOpen className="h-3.5 w-3.5" />
            VTU CSE exam prep
          </p>

          <nav className="mt-4 space-y-0.5 text-[14px]">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-[7px] text-academic-text-secondary transition hover:bg-slate-100 hover:text-academic-navy"
            >
              <SquarePen className="h-4 w-4" />
              New chat
            </button>
          </nav>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 px-2 text-[12px] text-academic-text-muted">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search chats"
                aria-label="Search chats"
                className="min-w-0 flex-1 bg-transparent placeholder:text-academic-text-muted focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <X className="h-3.5 w-3.5 hover:text-academic-navy" />
                </button>
              )}
            </div>
            <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
              {isLoadingSessions ? (
                <p className="flex items-center gap-2 px-2 py-3 text-[13px] text-academic-text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading chats…
                </p>
              ) : filteredConversations.length === 0 ? (
                <p className="px-2 py-3 text-[13px] text-academic-text-muted">No chats found.</p>
              ) : null}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-1 rounded-lg transition ${
                    conversation.id === activeId
                      ? "bg-academic-accent/10 font-medium text-academic-navy"
                      : "text-academic-text-muted hover:bg-slate-100 hover:text-academic-navy"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(conversation.id)}
                    className="min-w-0 flex-1 truncate px-2 py-[7px] text-left text-[13.5px]"
                    title={conversation.title}
                  >
                    {conversation.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(conversation.id)}
                    aria-label={`Delete ${conversation.title}`}
                    className="mr-1 rounded p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-academic-border px-2 pt-3 text-[12px] text-academic-text-muted">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-academic-navy text-[11px] font-semibold text-white">
              {userInitial}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="block truncate font-medium text-academic-text-secondary">{userLabel}</span>
              <span className="block truncate text-[11px] text-academic-text-muted">{userSub}</span>
            </span>
          </div>
        </aside>

        {/* Main column */}
        <section className="relative flex min-w-0 flex-1 flex-col bg-academic-bg">
          <header className="flex h-[52px] items-center gap-1 border-b border-academic-border px-3 sm:px-4">
            <div className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-md p-2 text-academic-text-muted hover:bg-slate-100 hover:text-academic-navy lg:hidden"
                aria-label="Open chats"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="hidden rounded-md p-2 text-academic-text-muted hover:bg-slate-100 hover:text-academic-navy lg:block"
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                title={activeConversation?.title || "Study chat"}
                className="group flex max-w-[34vw] items-center gap-1 rounded-md px-2 py-1.5 text-[14px] font-semibold text-academic-navy hover:bg-slate-100 sm:max-w-[380px]"
              >
                <span className="truncate">{activeConversation?.title || "Study chat"}</span>
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Copy chat transcript"
                title="Copy chat transcript"
                className="flex items-center gap-1.5 rounded-md bg-academic-navy px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-academic-navy-light"
              >
                {shareState === "copied" ? <Check className="h-3.5 w-3.5" /> : <Share className="h-3.5 w-3.5" />}
                {shareState === "copied" ? "Copied" : "Share"}
              </button>
            </div>
          </header>

          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-6 sm:px-8">
              {isLoadingThread ? (
                <div className="flex items-center gap-2 pt-16 text-[14px] text-academic-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading conversation…
                </div>
              ) : showLoadError ? (
                <div className="flex items-center gap-2 pt-16 text-[14px] text-academic-gold-dark">
                  <span>Could not load this conversation.</span>
                  <button
                    type="button"
                    onClick={() => activeConversation && handleSelect(activeConversation.id)}
                    className="flex items-center gap-1 rounded px-1.5 py-1 hover:bg-amber-50 hover:text-academic-gold-dark"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              ) : showEmptyState ? (
                <div className="pt-10" />
              ) : (
                <div className="space-y-6">
                  {activeConversation.messages.map((message, index) => {
                    if (message.role === "user") {
                      return (
                        <div key={index} className="flex flex-col items-end">
                          <div className="max-w-[82%] rounded-2xl bg-academic-navy px-4 py-2.5 text-[14.5px] leading-relaxed text-white shadow-soft">
                            {message.content}
                          </div>
                          {message.createdAt && (
                            <span className="mt-1 text-[11px] text-academic-text-muted">
                              {formatTime(message.createdAt)}
                            </span>
                          )}
                        </div>
                      );
                    }
                    const copyKey = `${activeId}-${index}`;
                    return (
                      <div key={index} className="group">
                        <AssistantBody content={message.content || ""} />
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-academic-text-muted">
                          {message.createdAt && <span>{formatTime(message.createdAt)}</span>}
                          {message.content && (
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(copyKey, message.content)}
                              className="flex items-center gap-1 rounded px-1.5 py-1 hover:bg-slate-100 hover:text-academic-navy"
                            >
                              {copiedId === copyKey ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedId === copyKey ? "Copied" : "Copy"}
                            </button>
                          )}
                          {message.error && (
                            <button
                              type="button"
                              onClick={handleRetry}
                              className="flex items-center gap-1 rounded px-1.5 py-1 text-academic-gold-dark hover:bg-amber-50 hover:text-academic-gold-dark"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-[13px] text-academic-text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span key={thinkingStatus} className="animate-fade-in">
                        {thinkingStatus}
                      </span>
                    </div>
                  )}
                  {error && !isLoading && (
                    <div className="flex items-center gap-2 text-[13px] text-academic-gold-dark">
                      <span>{error}</span>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-academic-gold-dark hover:bg-amber-50 hover:text-academic-gold-dark"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-3 sm:px-6">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[760px]">
              <div className="rounded-2xl border border-academic-border bg-white shadow-card">
                <div className="flex items-end gap-1.5 px-3 pb-2 pt-2.5">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    aria-label="Start new chat"
                    title="Start new chat"
                    className="mb-1 rounded-full p-1.5 text-academic-text-muted hover:bg-slate-100 hover:text-academic-navy"
                  >
                    <Plus className="h-[18px] w-[18px]" />
                  </button>
                  <textarea
                    ref={composerRef}
                    value={input}
                    rows={1}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage(event.currentTarget.value);
                      }
                    }}
                    placeholder="Ask a VTU syllabus question…"
                    aria-label="Study question"
                    className="max-h-[180px] min-h-[28px] flex-1 resize-none bg-transparent text-[14.5px] leading-6 text-academic-text placeholder:text-academic-text-muted focus:outline-none"
                  />
                  <button
                    type={isLoading ? "button" : "submit"}
                    onClick={isLoading ? handleStop : undefined}
                    disabled={!isLoading && !input.trim()}
                    aria-label={isLoading ? "Stop generating" : "Send message"}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-academic-accent text-white transition hover:bg-academic-accent-hover disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {isLoading ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] leading-4 text-academic-text-muted">
                CadenceAI is AI and can make mistakes. Please double-check exam-critical responses.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CadenceAI;
