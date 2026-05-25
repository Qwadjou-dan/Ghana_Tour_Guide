"use client";

import { useState, useRef, useEffect } from "react";

const QUICK_QUESTIONS = [
  "What's the best time to visit Ghana?",
  "Teach me a Twi greeting",
  "What should I eat in Ghana?",
  "Tell me about Cape Coast Castle",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const userMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages
      .filter((m) => m.role !== "system")
      .reduce((acc, m, i, arr) => {
        if (m.role === "user" && arr[i + 1]?.role === "assistant") {
          acc.push({ user: m.text, assistant: arr[i + 1].text });
        }
        return acc;
      }, []);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Sorry, I couldn't respond right now: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`fixed bottom-4 right-4 z-50 flex flex-col transition-all duration-300 ${
          isOpen ? "h-[520px] w-[380px]" : "h-auto w-auto"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col h-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-accent text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇭</span>
                <span className="font-bold text-sm">Akwaaba Guide</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-lg leading-none"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted mb-3">
                    Ask me about Ghanaian culture, tourism, or language!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-accent-soft text-accent border border-accent/30 hover:bg-accent hover:text-white transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-accent text-white rounded-br-md"
                        : "bg-accent-soft text-foreground rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent-soft text-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                    <span className="animate-pulse">…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 p-3 border-t border-border"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Ghana…"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-accent text-white rounded-full w-14 h-14 shadow-lg hover:bg-accent/90 transition flex items-center justify-center text-2xl"
            aria-label="Open Akwaaba Guide chat"
          >
            💬
          </button>
        )}
      </div>
    </>
  );
}
