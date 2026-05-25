"use client";

import { useState } from "react";

const QUICK_PROMPTS = [
  "Make day 2 less rushed",
  "I'm vegetarian — swap food picks",
  "Add more beach time",
  "Reduce the budget by 30%",
];

export default function ChatRefine({ onRefine, isLoading }) {
  const [message, setMessage] = useState("");

  function submit(text) {
    const value = (text ?? message).trim();
    if (!value || isLoading) return;
    onRefine(value);
    setMessage("");
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-1">
        Refine your itinerary
      </h3>
      <p className="text-xs text-muted mb-3">
        Ask for changes in plain English — the AI will update the plan.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => submit(q)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-accent-soft text-accent border border-accent/30 hover:bg-accent hover:text-white transition disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., add a heritage site on day 1"
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
