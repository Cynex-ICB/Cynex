import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  PanelLeft,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Share,
  Sparkles,
  Square,
  SquarePen,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api.js";

const STARTER_PROMPTS = [
  {
    title: "Explain Algorithm",
    prompt: "Explain Dijkstra's shortest path algorithm with time complexity and a trace example.",
    category: "Data Structures & Algorithms",
  },
  {
    title: "VTU CIE Preparation",
    prompt: "Compare IoT MQTT and HTTP protocols on packet overhead, latency, and reliability.",
    category: "Internet of Things",
  },
  {
    title: "Operating Systems",
    prompt: "Explain how to detect and resolve deadlocks using the Banker's algorithm with code.",
    category: "Systems & Architecture",
  },
  {
    title: "Blockchain Architecture",
    prompt: "How does Proof of Stake consensus differ from Proof of Work in energy and finality?",
    category: "Blockchain & Security",
  },
];

const CACHE_KEY = "cynai-chats-cache-v1";
const LEGACY_CACHE_KEY = "study-companion-chats-cache-v1";
const SETTINGS_KEY = "cadenceai-provider-v1";

// ── Supported external AI providers (all require user API key) ────────────────
const AI_PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "200+ models — Llama, Mistral, Gemma, Claude & more. Free tier available.",
    badge: "Free tier",
    badgeColor: "#10B981",
    docsUrl: "https://openrouter.ai/keys",
    placeholder: "sk-or-v1-...",
    models: [
      { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (Free)" },
      { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (Free)" },
      { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (Free)" },
      { id: "qwen/qwen-2.5-7b-instruct:free", label: "Qwen 2.5 7B (Free)" },
      { id: "microsoft/phi-3-mini-128k-instruct:free", label: "Phi-3 Mini 128K (Free)" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Blazing-fast inference. Generous free tier — no credit card needed.",
    badge: "Ultra-fast",
    badgeColor: "#F59E0B",
    docsUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    models: [
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      { id: "gemma2-9b-it", label: "Gemma 2 9B" },
    ],
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "GPU-accelerated models on NVIDIA infrastructure. Free credits on sign-up.",
    badge: "GPU-powered",
    badgeColor: "#76B900",
    docsUrl: "https://build.nvidia.com/explore/discover",
    placeholder: "nvapi-...",
    browserFetch: false, // NVIDIA NIM blocks browser CORS on /v1/models
    models: [
      { id: "meta/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
      { id: "meta/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
      { id: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
      { id: "mistralai/mistral-7b-instruct-v0.3", label: "Mistral 7B" },
      { id: "mistralai/mixtral-8x7b-instruct-v0.1", label: "Mixtral 8x7B" },
      { id: "microsoft/phi-3-mini-128k-instruct", label: "Phi-3 Mini" },
      { id: "google/gemma-2-9b-it", label: "Gemma 2 9B" },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Open-source models with $25 free credits on sign-up.",
    badge: "Free credits",
    badgeColor: "#3B82F6",
    docsUrl: "https://api.together.ai/settings/api-keys",
    placeholder: "...",
    models: [
      { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", label: "Llama 3.1 8B Turbo" },
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", label: "Llama 3.1 70B Turbo" },
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B" },
      { id: "Qwen/Qwen2.5-7B-Instruct-Turbo", label: "Qwen 2.5 7B" },
    ],
  },
];

function loadProviderSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { providerId: "", apiKey: "", modelId: "" };
    return { providerId: "", apiKey: "", modelId: "", ...JSON.parse(raw) };
  } catch {
    return { providerId: "", apiKey: "", modelId: "" };
  }
}

function saveProviderSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { }
}

// Direct browser-side call to OpenAI-compatible provider
async function callProvider(provider, modelId, apiKey, messages, signal) {
  const systemMsg = {
    role: "system",
    content: "You are CadenceAI, an intelligent academic study companion for CSE/ICB students. Help with coursework, exam preparation, programming, and academic topics. Be clear, structured, and student-friendly.",
  };
  const body = { model: modelId, messages: [systemMsg, ...messages], stream: true };
  let url, headers;
  if (provider.id === "openrouter") {
    url = "https://openrouter.ai/api/v1/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "HTTP-Referer": window.location.origin, "X-Title": "CadenceAI" };
  } else if (provider.id === "groq") {
    url = "https://api.groq.com/openai/v1/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
  } else if (provider.id === "nvidia") {
    url = "https://integrate.api.nvidia.com/v1/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    body.max_tokens = 1024;
  } else if (provider.id === "together") {
    url = "https://api.together.xyz/v1/chat/completions";
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
  } else {
    throw new Error("Unknown provider.");
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `${provider.name} error ${res.status}`);
  }
  return res;
}

async function* parseSSE(response) {
  const reader = response.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (; ;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { }
    }
  }
}

// ── Backend chat (proxied server-side, no browser CORS) ─────────────────────
// Streams plain text from POST /api/cynai/chat. Accepts a plain object
// (sent as JSON) or FormData (for file uploads). Yields text chunks.
async function* streamBackendChat(payload, signal) {
  const token = localStorage.getItem("authToken") || "";
  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  const res = await fetch(`${API_BASE_URL}/cynai/chat`, {
    method: "POST",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isForm ? payload : JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `CynAI error ${res.status}`);
  }
  const sessionId = res.headers.get("X-Cynai-Session-Id") || "";
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  // First yield the session id as metadata via a special object chunk.
  yield { __sessionId: sessionId };
  for (; ;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = dec.decode(value, { stream: true });
    if (text) yield text;
  }
}

// ── Fetch models via backend proxy (server keys, fixes CORS e.g. NVIDIA) ────
// GET /api/cynai/models/:providerId — requires JWT, no user key needed.
async function fetchBackendModels(providerId) {
  const token = localStorage.getItem("authToken") || "";
  const res = await fetch(`${API_BASE_URL}/cynai/models/${providerId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Could not load models (${res.status})`);
  return data; // { id, name, source: live|curated|unavailable, models, error? }
}

// ── Fetch live models from a provider's /models endpoint ─────────────────────
// Direct browser fallback (BYOK). Kept for offline use; backend proxy is primary.
async function fetchProviderModels(provider, apiKey) {
  let url, headers;
  if (provider.id === "openrouter") {
    url = "https://openrouter.ai/api/v1/models";
    headers = { Authorization: `Bearer ${apiKey}` };
  } else if (provider.id === "groq") {
    url = "https://api.groq.com/openai/v1/models";
    headers = { Authorization: `Bearer ${apiKey}` };
  } else if (provider.id === "nvidia") {
    url = "https://integrate.api.nvidia.com/v1/models";
    headers = { Authorization: `Bearer ${apiKey}` };
  } else if (provider.id === "together") {
    url = "https://api.together.xyz/v1/models";
    headers = { Authorization: `Bearer ${apiKey}` };
  } else {
    throw new Error("Unknown provider");
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `${provider.name} returned ${res.status}`);
  }
  const data = await res.json();
  const rawList = data.data ?? data.models ?? data ?? [];
  return rawList
    .filter(m => {
      const id = (m.id || m.name || "").toLowerCase();
      const type = (m.type || m.object || "").toLowerCase();
      if (type && (type.includes("embed") || type.includes("tts") || type.includes("image") || type.includes("whisper"))) return false;
      if (id.includes("embed") || id.includes("tts") || id.includes("whisper") || id.includes("dall-e") || id.includes("stable-diffusion")) return false;
      return true;
    })
    .map(m => ({ id: m.id || m.name, label: m.name || m.id }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// ── ProviderFields: API key input + fetch models button + model dropdown ──────
function ProviderFields({ provider, draft, setDraft, showKey, setShowKey }) {
  const [fetchState, setFetchState] = useState("idle");
  const [fetchError, setFetchError] = useState("");
  const [fetchedModels, setFetchedModels] = useState([]);
  const [modelSource, setModelSource] = useState("");

  useEffect(() => {
    setFetchState("idle");
    setFetchError("");
    setFetchedModels([]);
    setModelSource("");
  }, [provider.id]);

  const handleFetchModels = async () => {
    setFetchState("loading");
    setFetchError("");
    try {
      // Primary: backend proxy with server keys (auth required, no user key needed).
      const data = await fetchBackendModels(provider.id);
      const models = data.models || [];
      if (models.length === 0) throw new Error(data.error || "No chat models found.");
      setFetchedModels(models);
      setModelSource(data.source || "live");
      const ids = models.map(m => m.id);
      if (!ids.includes(draft.modelId)) {
        setDraft(prev => ({ ...prev, modelId: models[0].id }));
      }
      if (data.error) setFetchError(`${data.error} (showing fallback list)`);
      setFetchState("done");
    } catch (err) {
      // Fallback: direct provider call with user key, if one was entered.
      const key = draft.apiKey?.trim();
      if (key && provider.browserFetch !== false) {
        try {
          const models = await fetchProviderModels(provider, key);
          if (models.length === 0) throw new Error("No chat models found for this key.");
          setFetchedModels(models);
          setModelSource("direct");
          const ids = models.map(m => m.id);
          if (!ids.includes(draft.modelId)) {
            setDraft(prev => ({ ...prev, modelId: models[0].id }));
          }
          setFetchState("done");
          return;
        } catch (directErr) {
          setFetchError(directErr.message || "Failed to fetch models.");
        }
      } else {
        setFetchError(err.message || "Failed to fetch models.");
      }
      setFetchState("error");
    }
  };

  const modelList = fetchedModels.length > 0 ? fetchedModels : provider.models;
  const canFetch = fetchState !== "loading";

  return (
    <div className="space-y-4 px-6 pb-2 pt-4">
      {/* API Key */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[12px] font-semibold uppercase tracking-wider text-academic-text-muted">API Key</label>
          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">
            Get free key <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={draft.apiKey || ""}
            onChange={e => setDraft(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder={provider.placeholder || "Paste your API key"}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 font-mono text-[13px] text-academic-navy placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button type="button" onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label={showKey ? "Hide" : "Show"}>
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-academic-text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Stored only in this browser — never sent to Cadence servers
        </p>
      </div>

      {/* Model selector + Fetch button */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[12px] font-semibold uppercase tracking-wider text-academic-text-muted">
            Model
            {fetchState === "done" && (
              <span className="ml-2 font-normal normal-case text-emerald-600">
                · {fetchedModels.length} loaded{modelSource ? ` via ${modelSource}` : ""}
              </span>
            )}
          </label>

          {/* Fetch button — backend proxy, no CORS issues, no key required */}
          <button
            type="button"
            onClick={handleFetchModels}
            disabled={!canFetch}
            title="Fetch available models from server"
            className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {fetchState === "loading" ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Fetching…</>
            ) : fetchState === "done" ? (
              <><RotateCcw className="h-3 w-3" /> Refresh</>
            ) : (
              <><Zap className="h-3 w-3" /> Fetch models</>
            )}
          </button>
        </div>

        {fetchState === "error" && fetchError && (
          <p className="mb-2 flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11.5px] text-red-600">
            <X className="h-3.5 w-3.5 shrink-0" /> {fetchError}
          </p>
        )}

        <div className="relative">
          <select
            value={draft.modelId || modelList[0]?.id || ""}
            onChange={e => setDraft(prev => ({ ...prev, modelId: e.target.value }))}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-[13px] text-academic-navy focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            {modelList.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {fetchState === "idle" && (
          <p className="mt-1.5 text-[11px] text-academic-text-muted">
            Click <strong>Fetch models</strong> to load all available models from the server.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [draft, setDraft] = useState(settings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) { setDraft(settings); setShowKey(false); setSaved(false); }
  }, [isOpen, settings]);

  const selectedProvider = AI_PROVIDERS.find(p => p.id === draft.providerId) ?? null;

  const handleProviderChange = (id) => {
    const p = AI_PROVIDERS.find(p => p.id === id);
    setDraft(prev => ({ ...prev, providerId: id, modelId: p?.models?.[0]?.id ?? "", apiKey: "" }));
  };

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const canSave = selectedProvider && draft.apiKey?.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,31,58,0.72)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog" aria-modal="true" aria-label="CadenceAI Settings"
    >
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <KeyRound className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-academic-navy">AI Provider Setup</h2>
            <p className="text-[11.5px] text-academic-text-muted">Your key stays in your browser — never sent to our servers</p>
          </div>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-200" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 overflow-y-auto">
          {/* Provider grid */}
          <div className="px-6 pt-5 pb-2">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-academic-text-muted">Choose a provider</p>
            <div className="grid grid-cols-2 gap-2">
              {AI_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id)}
                  className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition ${draft.providerId === p.id
                      ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-academic-navy">{p.name}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: p.badgeColor }}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-academic-text-muted">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Provider-specific key + model fields */}
          {selectedProvider && (
            <ProviderFields
              key={selectedProvider.id}
              provider={selectedProvider}
              draft={draft}
              setDraft={setDraft}
              showKey={showKey}
              setShowKey={setShowKey}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-[13px] font-medium text-academic-text-muted hover:bg-slate-100">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="flex items-center gap-2 rounded-lg bg-academic-navy px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-academic-navy-light disabled:cursor-not-allowed disabled:opacity-40">
            {saved ? <Check className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
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
            navigator.clipboard?.writeText(code).catch(() => { });
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
    title: "New Conversation",
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
    title: session.title || "New Conversation",
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [providerSettings, setProviderSettings] = useState(loadProviderSettings);
  const [attachments, setAttachments] = useState([]);
  const threadRef = useRef(null);
  const composerRef = useRef(null);
  const abortRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeIdRef = useRef(activeId);

  const MAX_ATTACHMENTS = 5;
  const MAX_FILE_BYTES = 15 * 1024 * 1024;

  const handlePickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (picked.length === 0) return;
    setAttachments((prev) => {
      const next = [...prev];
      for (const file of picked) {
        if (next.length >= MAX_ATTACHMENTS) {
          setError(`Up to ${MAX_ATTACHMENTS} files per message.`);
          break;
        }
        if (file.size > MAX_FILE_BYTES) {
          setError(`"${file.name}" exceeds 15 MB and was skipped.`);
          continue;
        }
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          name: file.name,
          size: file.size,
        });
      }
      return next;
    });
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const activeProvider = AI_PROVIDERS.find(p => p.id === providerSettings.providerId) ?? null;
  const hasApiKey = Boolean(activeProvider && providerSettings.apiKey?.trim());

  const handleSaveSettings = (s) => {
    setProviderSettings(s);
    saveProviderSettings(s);
  };

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
            body: JSON.stringify({ title: "New Conversation" }),
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
          body: JSON.stringify({ title: "New Conversation", subject: "" }),
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
    const outgoingFiles = attachments;
    if ((!userMessage && outgoingFiles.length === 0) || isLoading || !activeConversation) return;

    const history = activeConversation.messages.filter(
      (message) => (message.role === "user" || message.role === "assistant") && message.content
    );
    setInput("");
    setAttachments([]);
    setError("");
    const stampedUser = {
      role: "user",
      content: userMessage,
      attachments: outgoingFiles.map((a) => a.name),
      createdAt: Date.now(),
    };
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
      // Default: backend proxy (server keys, no browser CORS).
      // Direct provider call only when user set a key for a CORS-friendly
      // provider AND no files are attached (files always go via backend).
      const useDirect =
        outgoingFiles.length === 0 &&
        Boolean(activeProvider) &&
        activeProvider.browserFetch !== false &&
        Boolean(providerSettings.apiKey?.trim());
      const msgHistory = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ];

      updateActiveMessages(
        (messages) => [...messages, { role: "assistant", content: "", createdAt: Date.now() }]
      );
      let assistantContent = "";

      if (useDirect) {
        const modelId = providerSettings.modelId || activeProvider?.models[0]?.id || "";
        const response = await callProvider(activeProvider, modelId, providerSettings.apiKey, msgHistory, controller.signal);
        for await (const chunk of parseSSE(response)) {
          assistantContent += chunk;
          const snap = assistantContent;
          updateActiveMessages((messages) => {
            const updated = [...messages];
            updated[updated.length - 1] = { role: "assistant", content: snap, createdAt: Date.now() };
            return updated;
          });
        }
      } else {
        const isLocal = !activeConversation.id || String(activeConversation.id).startsWith("local-");
        const backendPayload = {
          message: userMessage || (outgoingFiles.length > 0 ? "Please analyze the attached file(s)." : ""),
          history: history.map(m => ({ role: m.role, content: m.content })),
          subject: activeConversation.subject || "",
          sessionId: isLocal ? undefined : activeConversation.id,
          title: activeConversation.title,
          provider: providerSettings.providerId || "nvidia",
          model: providerSettings.modelId || undefined,
        };
        let payload = backendPayload;
        if (outgoingFiles.length > 0) {
          const form = new FormData();
          form.append("message", backendPayload.message);
          form.append("history", JSON.stringify(backendPayload.history));
          if (backendPayload.subject) form.append("subject", backendPayload.subject);
          if (backendPayload.sessionId) form.append("sessionId", backendPayload.sessionId);
          if (backendPayload.title) form.append("title", backendPayload.title);
          form.append("provider", backendPayload.provider);
          if (backendPayload.model) form.append("model", backendPayload.model);
          for (const a of outgoingFiles) form.append("files", a.file, a.name);
          payload = form;
        }
        for await (const chunk of streamBackendChat(payload, controller.signal)) {
          if (chunk && typeof chunk === "object" && "__sessionId" in chunk) {
            const serverId = chunk.__sessionId;
            if (serverId && isLocal) {
              const tempId = activeConversation.id;
              setConversations((previous) =>
                previous.map((c) => (c.id === tempId ? { ...c, id: serverId, local: false } : c))
              );
              activeIdRef.current = serverId;
              setActiveId(serverId);
            }
            continue;
          }
          assistantContent += chunk;
          const snap = assistantContent;
          updateActiveMessages((messages) => {
            const updated = [...messages];
            updated[updated.length - 1] = { role: "assistant", content: snap, createdAt: Date.now() };
            return updated;
          });
        }
      }
      if (!assistantContent.trim()) throw new Error("Empty response. Please try again.");
      // Sessions are local-only when using external providers
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
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={providerSettings}
        onSave={handleSaveSettings}
      />


      {/* ── Chat UI (always visible) ── */}
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
          className={`z-40 flex w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 pb-3 pt-4 transition-[margin,transform] duration-200 max-lg:absolute max-lg:inset-y-0 max-lg:left-0 ${
            mobileSidebarOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
          } ${sidebarOpen ? "lg:ml-0" : "lg:-ml-[260px]"}`}
        >
          {/* Header */}
          <div className="px-2 pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-academic-accent" />
                <span>CadenceAI</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Department Study Assistant</p>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
              title="New Chat"
              aria-label="New chat"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 focus-within:border-slate-300 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-200 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search conversations…"
              aria-label="Search chats"
              className="min-w-0 flex-1 bg-transparent placeholder:text-slate-400 text-xs text-slate-800 focus:outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            )}
          </div>

          <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {isLoadingSessions && filteredConversations.length === 0 ? (
              <p className="flex items-center gap-2 px-2 py-3 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading conversations…
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate-400">No conversations found.</p>
            ) : null}
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition text-xs ${
                  conversation.id === activeId
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(conversation.id)}
                  className="min-w-0 flex-1 truncate text-left"
                  title={conversation.title}
                >
                  {conversation.title}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title}`}
                  className="rounded p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100 text-slate-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* User profile info */}
          <div className="mt-auto border-t border-slate-200/80 px-2 pt-3 flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {userInitial}
            </span>
            <span className="min-w-0 flex-1 truncate text-left">
              <span className="block truncate text-xs font-semibold text-slate-800 leading-tight">
                {userLabel}
              </span>
              <span className="block truncate text-[11px] font-mono text-slate-400">
                {userSub}
              </span>
            </span>
          </div>
        </aside>

        {/* Main column */}
        <section className="relative flex min-w-0 flex-1 flex-col bg-slate-50/40">
          <header className="flex h-[52px] items-center gap-2 border-b border-slate-200/80 bg-white px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                aria-label="Open chats"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:block"
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 pl-1 truncate">
                <span className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                  {activeConversation?.title || "New Conversation"}
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Provider status badge */}
              {hasApiKey ? (
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Provider configured. Click to adjust settings."
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-800">{activeProvider?.name}</span>
                  <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
                    ({providerSettings.modelId?.split("/").pop() || "model"})
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
                  title="Configure your free API key to start chatting"
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-700" />
                  <span>Connect API Key</span>
                </button>
              )}

              {/* Settings button */}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                title="AI Provider Settings"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Copy chat transcript"
                title="Copy chat transcript"
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {shareState === "copied" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Share className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>{shareState === "copied" ? "Copied" : "Share"}</span>
              </button>
            </div>
          </header>

          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-6 sm:px-8">
              {isLoadingThread ? (
                <div className="flex items-center justify-center gap-2 pt-24 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-academic-accent" />
                  Loading conversation…
                </div>
              ) : showLoadError ? (
                <div className="flex flex-col items-center justify-center gap-3 pt-24 text-xs text-amber-700">
                  <span>Could not load this conversation.</span>
                  <button
                    type="button"
                    onClick={() => activeConversation && handleSelect(activeConversation.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              ) : showEmptyState ? (
                <div className="py-8 sm:py-14 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-academic-accent" />
                    <span>Cadence Academic Intelligence</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    What would you like to study today?
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Ask coursework questions, analyze VTU syllabus units, prepare for CIE examinations, or inspect code implementations.
                  </p>

                  {!hasApiKey && (
                    <div className="mt-6 p-4 sm:p-5 rounded-xl border border-amber-200/90 bg-amber-50/70 text-left max-w-xl mx-auto shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                            Connect Your AI Provider
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            To begin chatting, connect a free API key (Groq, OpenRouter, NVIDIA NIM, or Together AI). Your key is stored securely in your browser.
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSettingsOpen(true)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Configure Provider Key</span>
                            </button>
                            <span className="text-[11px] text-slate-400">Takes ~30 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                    {STARTER_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!hasApiKey) {
                            setSettingsOpen(true);
                          } else {
                            sendMessage(item.prompt);
                          }
                        }}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left group shadow-xs"
                      >
                        <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <span className="text-xs font-medium text-slate-800 mt-1 block group-hover:text-academic-accent transition-colors line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeConversation.messages.map((message, index) => {
                    if (message.role === "user") {
                      return (
                        <div key={index} className="flex flex-col items-end">
                          <div className="max-w-[82%] rounded-2xl bg-academic-navy px-4 py-2.5 text-[14.5px] leading-relaxed text-white shadow-soft">
                            {message.content}
                            {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                              <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                                {message.attachments.map((name, i) => (
                                  <span
                                    key={i}
                                    className="flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white"
                                  >
                                    <Paperclip className="h-3 w-3" />
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}
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
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                    {attachments.map((a) => (
                      <span
                        key={a.id}
                        className="flex max-w-full items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-academic-navy"
                      >
                        <Paperclip className="h-3 w-3 shrink-0 text-indigo-500" />
                        <span className="max-w-[180px] truncate">{a.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(a.id)}
                          aria-label={`Remove ${a.name}`}
                          className="rounded p-0.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-1.5 px-3 pb-2 pt-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach files"
                    title="Attach files"
                    className="mb-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <Paperclip className="h-[18px] w-[18px]" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handlePickFiles}
                    accept=".txt,.md,.markdown,.csv,.json,.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.gif,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.xml,.yaml,.yml,.log,.sql"
                  />
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
                    placeholder="Ask a VTU syllabus or coursework question… (Enter to send)"
                    aria-label="Study question"
                    className="max-h-[180px] min-h-[28px] flex-1 resize-none bg-transparent text-[14px] leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type={isLoading ? "button" : "submit"}
                    onClick={isLoading ? handleStop : undefined}
                    disabled={!isLoading && !input.trim() && attachments.length === 0}
                    aria-label={isLoading ? "Stop generating" : "Send message"}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {isLoading ? (
                      <Square className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] leading-4 text-slate-400">
                CadenceAI provides academic coursework assistance. Verify exam and syllabus details with official VTU courseware.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CadenceAI;
