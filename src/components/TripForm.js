"use client";

import { useEffect, useState } from "react";

const INTEREST_OPTIONS = [
  { id: "heritage", label: "Heritage & history", emoji: "🏛️" },
  { id: "nature", label: "Nature & wildlife", emoji: "🌿" },
  { id: "beaches", label: "Beaches", emoji: "🏖️" },
  { id: "food", label: "Food & markets", emoji: "🍲" },
  { id: "culture", label: "Culture & crafts", emoji: "🎨" },
  { id: "adventure", label: "Adventure", emoji: "🥾" },
  { id: "nightlife", label: "Nightlife & city", emoji: "🌃" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
];

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function TripForm({ onSubmit, isLoading }) {
  const [travelerType, setTravelerType] = useState("diaspora");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [budgetTier, setBudgetTier] = useState("mid");
  const [interests, setInterests] = useState(["heritage", "food", "culture"]);
  const [extraNotes, setExtraNotes] = useState("");

  useEffect(() => {
    setArrivalDate(todayISO(14));
    setDepartureDate(todayISO(19));
  }, []);

  function toggleInterest(id) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      travelerType,
      arrivalDate,
      departureDate,
      budgetTier,
      interests,
      extraNotes,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 shadow-lg space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          I am a…
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: "diaspora", label: "Diaspora returnee" },
            { id: "international", label: "International tourist" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTravelerType(opt.id)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                travelerType === opt.id
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-foreground border-border hover:border-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Arrival
          </label>
          <input
            type="date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Departure
          </label>
          <input
            type="date"
            value={departureDate}
            min={arrivalDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Budget tier
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "budget", label: "Budget", hint: "≤300 GHS/day" },
            { id: "mid", label: "Mid-range", hint: "400–800 GHS/day" },
            { id: "premium", label: "Premium", hint: "1000+ GHS/day" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBudgetTier(opt.id)}
              className={`px-3 py-3 rounded-xl border text-sm font-medium transition text-center ${
                budgetTier === opt.id
                  ? "bg-green text-white border-green"
                  : "bg-white text-foreground border-border hover:border-green/40"
              }`}
            >
              <div>{opt.label}</div>
              <div className="text-[11px] opacity-80 font-normal mt-0.5">
                {opt.hint}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const active = interests.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleInterest(opt.id)}
                className={`px-3 py-2 rounded-full border text-sm transition ${
                  active
                    ? "bg-accent-soft text-accent border-accent"
                    : "bg-white text-foreground border-border hover:border-accent/40"
                }`}
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Anything else? (optional)
        </label>
        <textarea
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="e.g., traveling with kids, vegetarian, mobility needs, first-time visitor…"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent/90 active:bg-accent/80 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Crafting your itinerary…" : "Plan my Ghana trip"}
      </button>
    </form>
  );
}
