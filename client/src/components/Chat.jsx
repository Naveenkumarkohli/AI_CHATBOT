import React, { useEffect, useMemo, useRef, useState } from "react";
import { sendChat } from "../services/api.js";
import MessageBubble from "./MessageBubble.jsx";
import { SendIcon } from "./Icons.jsx";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: generateId(), role: "assistant", content: "Hi! I'm your AI assistant. Ask me anything. 🧠💬" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!canSend) return;

    try {
      setError("");
      const userMsg = { id: generateId(), role: "user", content: input.trim() };
      setMessages(m => [...m, userMsg]);
      setInput("");
      setLoading(true);

      const payload = messages
        .filter(m => m.role !== "error")
        .concat(userMsg)
        .map(({ role, content }) => ({ role, content }));

      const { text } = await sendChat({
        model: "bigscience/bloom-560m", // small text generation model
        messages: payload,
      });

      setMessages(m => [...m, { id: generateId(), role: "assistant", content: text || "(No response)" }]);
    } catch (e) {
      console.error("Chat error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setMessages(m => [...m, { id: generateId(), role: "error", content: `⚠️ Request failed: ${msg}` }]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([{ id: generateId(), role: "assistant", content: "Chat cleared. How can I help now?" }]);
    setError("");
  }

  return (
    <div className="chat">
      <div ref={listRef} className="chat__list">
        {messages.map(m => (<MessageBubble key={m.id} role={m.role} text={m.content} />))}
        {loading && (
          <div className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="spinner" /> Thinking…
          </div>
        )}
      </div>

      <div className="composer">
        <div className="composer__inner">
          <div className="box">
            <textarea
              className="input"
              rows={1}
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              style={{ resize: "none" }}
            />
            <div className="toolbar">
              <div className="small">{error ? "Error — try again" : ""}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" disabled={!canSend} onClick={handleSend}>
                  <SendIcon /> {loading ? "Sending…" : "Send"}
                </button>
                <button className="btn ghost" onClick={clearChat}>Clear</button>
              </div>
            </div>
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            Backend: <code>{import.meta.env.VITE_API_BASE || "/api"}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
