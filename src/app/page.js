"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import TripForm from "@/components/TripForm";
import Itinerary from "@/components/Itinerary";
import ChatRefine from "@/components/ChatRefine";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full rounded-2xl border border-border bg-card flex items-center justify-center text-muted text-sm">
      Loading map…
    </div>
  ),
});

export default function Home() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generateItinerary(formData) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to generate itinerary");
      setItinerary(data.itinerary);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          document
            .getElementById("itinerary-section")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function refineItinerary(refinementRequest) {
    if (!itinerary) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "refine",
          currentItinerary: itinerary,
          refinementRequest,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refine itinerary");
      setItinerary(data.itinerary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const allDestinationIds = useMemo(() => {
    if (!itinerary?.days) return [];
    const ids = new Set();
    for (const day of itinerary.days) {
      for (const id of day.destinationIds || []) ids.add(id);
    }
    return Array.from(ids);
  }, [itinerary]);

  return (
    <main className="flex-1">
      <header className="bg-gradient-to-br from-accent to-green text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="black"
              aria-hidden="true"
              className="w-8 h-8 text-gold shrink-0 drop-shadow"
            >
              <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.401 8.171L12 18.896l-7.335 3.863 1.401-8.171L.132 9.211l8.2-1.193z" />
            </svg>
            <h1 className="text-5xl uppercase tracking-widest font-bold opacity-90">
              Akwaaba AI
            </h1>
          </div>

          <span className="text-lg sm:text-xs font-semibold leading-tight max-w-3xl">
            Plan a meaningful trip to Ghana — in minutes.
          </span>
          <p className="text-xs sm:text-xs mt-4 max-w-2xl text-white/90">
            AI-crafted day-by-day itineraries for diaspora returnees and
            international tourists. Heritage sites, local food, real budgets,
            and an interactive map — all in one place.
          </p>
        </div>
      </header>

      <section className="relative py-10">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1727023663921-967d01f69c7e?auto=format&fit=crop&w=2400&q=70')",
          }}
          aria-hidden="true"
        />
        {/* Subtle overlay — keeps text readable while letting the image show */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <TripForm onSubmit={generateItinerary} isLoading={isLoading} />
              {error && (
                <div className="mt-4 bg-accent-soft border border-accent/40 text-accent text-sm rounded-xl px-4 py-3">
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              {!itinerary && !isLoading && (
                <div className="bg-card/40 backdrop-blur-md border border-dashed border-border rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center shadow-lg">
                  <div className="text-5xl mb-3">🇬🇭</div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Your itinerary will appear here
                  </h2>
                  <p className="text-sm text-muted max-w-md">
                    Tell us when you&apos;re coming, what you love, and your
                    budget. We&apos;ll craft a day-by-day trip with heritage,
                    food, and the best of Ghana.
                  </p>
                </div>
              )}

              {isLoading && !itinerary && (
                <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center shadow-lg">
                  <div className="animate-pulse text-3xl mb-2">✨</div>
                  <p className="text-foreground font-medium">
                    Crafting your Ghana itinerary…
                  </p>
                  <p className="text-xs text-muted mt-1">
                    This usually takes 10–20 seconds.
                  </p>
                </div>
              )}

              {itinerary && (
                <div id="itinerary-section" className="space-y-6">
                  {allDestinationIds.length > 0 && (
                    <MapView destinationIds={allDestinationIds} />
                  )}
                  <Itinerary itinerary={itinerary} />
                  <ChatRefine
                    onRefine={refineItinerary}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted flex flex-wrap items-center justify-between gap-2">
          <div>
            Built for the GIZ AI Program · Codetrain Africa Demo Day 2026
          </div>
          <div>Powered by Gemini · OpenStreetMap</div>
        </div>
      </footer>
    </main>
  );
}
