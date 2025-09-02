const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function sendChat({ model, messages }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json(); // returns { text: "..." }
}
