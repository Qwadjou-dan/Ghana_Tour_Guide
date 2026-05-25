"use client";

import destinations from "@/data/destinations.json";

function lookupDestination(id) {
  return destinations.find((d) => d.id === id);
}

function formatGHS(n) {
  if (typeof n !== "number") return "—";
  return `GHS ${n.toLocaleString()}`;
}

function googleMapsViewUrl(dest) {
  if (!dest) return null;
  const query = encodeURIComponent(`${dest.name}, ${dest.region} Region, Ghana`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function googleMapsDirectionsUrl(dest) {
  if (!dest?.coordinates) return null;
  const { lat, lng } = dest.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function Itinerary({ itinerary }) {
  if (!itinerary) return null;
  const { summary, days = [], budgetBreakdown, culturalTips = [], packingNotes } =
    itinerary;

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-accent mb-2">
            Your Ghana journey
          </h2>
          <p className="text-foreground/80 leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="space-y-4">
        {days.map((day) => (
          <article
            key={day.day}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted font-semibold">
                  Day {day.day}
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {day.title}
                </h3>
              </div>
              {typeof day.estimatedCostGHS === "number" && (
                <div className="text-right">
                  <div className="text-xs text-muted">Est. spend</div>
                  <div className="text-base font-semibold text-green">
                    {formatGHS(day.estimatedCostGHS)}
                  </div>
                </div>
              )}
            </div>

            {Array.isArray(day.activities) && day.activities.length > 0 && (
              <ul className="space-y-3 mb-4">
                {day.activities.map((act, i) => {
                  const dest = lookupDestination(act.destinationId);
                  const viewUrl = googleMapsViewUrl(dest);
                  const dirUrl = googleMapsDirectionsUrl(dest);
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-20 text-xs font-semibold text-accent uppercase tracking-wide pt-0.5">
                        {act.time}
                      </div>
                      <div className="flex-1 text-sm text-foreground/90">
                        <p>{act.description}</p>
                        {dest && (
                          <div className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent font-semibold hover:underline"
                            >
                              📍 {dest.name}
                            </a>
                            <span className="text-muted">·</span>
                            <span className="text-muted">{dest.region} Region</span>
                            {dirUrl && (
                              <>
                                <span className="text-muted">·</span>
                                <a
                                  href={dirUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green font-semibold hover:underline"
                                >
                                  🧭 Directions
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {Array.isArray(day.food) && day.food.length > 0 && (
              <div className="border-t border-border pt-3 mb-3">
                <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">
                  🍲 Food picks
                </div>
                <ul className="text-sm text-foreground/90 space-y-1">
                  {day.food.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {day.transport && (
              <div className="text-sm text-foreground/80 border-t border-border pt-3 mb-3">
                <span className="font-semibold text-foreground">🚐 Getting around: </span>
                {day.transport}
              </div>
            )}

            {day.tips && (
              <div className="text-sm text-foreground/80 bg-accent-soft/40 rounded-lg px-3 py-2">
                <span className="font-semibold text-accent">💡 Tip: </span>
                {day.tips}
              </div>
            )}
          </article>
        ))}
      </div>

      {budgetBreakdown && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Budget breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <BudgetCell label="Accommodation" value={budgetBreakdown.accommodationGHS} />
            <BudgetCell label="Transport" value={budgetBreakdown.transportGHS} />
            <BudgetCell label="Food" value={budgetBreakdown.foodGHS} />
            <BudgetCell label="Activities" value={budgetBreakdown.activitiesGHS} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="text-base font-bold text-foreground">
              Total: {formatGHS(budgetBreakdown.totalGHS)}
            </div>
            {budgetBreakdown.totalUSDApprox ? (
              <div className="text-sm text-muted">
                ≈ ${budgetBreakdown.totalUSDApprox.toLocaleString()} USD
              </div>
            ) : null}
          </div>
        </div>
      )}

      {culturalTips.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-3">
            Cultural tips
          </h3>
          <ul className="space-y-2 text-sm text-foreground/90">
            {culturalTips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">✦</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {packingNotes && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-2">
            Packing notes
          </h3>
          <p className="text-sm text-foreground/90">{packingNotes}</p>
        </div>
      )}
    </div>
  );
}

function BudgetCell({ label, value }) {
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm font-semibold text-foreground">
        {formatGHS(value)}
      </div>
    </div>
  );
}
