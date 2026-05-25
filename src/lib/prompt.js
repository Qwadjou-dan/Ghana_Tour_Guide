import destinations from "@/data/destinations.json";

function filterDestinationsByInterests(interests = []) {
  if (!interests.length) return destinations;
  const interestToTags = {
    history: ["heritage", "unesco", "slave-trade", "diaspora", "independence", "pan-africanism", "ancient"],
    heritage: ["heritage", "diaspora", "slave-trade", "year-of-return", "ashanti"],
    nature: ["nature", "rainforest", "wildlife", "waterfall", "lake", "hike", "garden"],
    wildlife: ["safari", "wildlife", "monkeys", "elephants", "crocodiles"],
    beaches: ["beach", "swimming", "surfing"],
    food: ["market", "city", "culture"],
    culture: ["culture", "kente", "craft", "festival", "ashanti", "weaving"],
    nightlife: ["nightlife", "city", "restaurants", "music"],
    adventure: ["adventure", "hike", "safari", "canoe", "surfing"],
    shopping: ["market", "shopping", "kente", "crafts"]
  };

  const acceptedTags = new Set();
  for (const interest of interests) {
    const key = String(interest).toLowerCase();
    (interestToTags[key] || [key]).forEach((t) => acceptedTags.add(t));
  }

  const matched = destinations.filter(
    (d) =>
      d.tags.some((t) => acceptedTags.has(t)) ||
      acceptedTags.has(d.type)
  );

  // Always keep at least 10 destinations so the model has variety.
  if (matched.length >= 10) return matched;
  const remaining = destinations.filter((d) => !matched.includes(d));
  return [...matched, ...remaining].slice(0, Math.max(12, matched.length));
}

export function buildItineraryPrompt({
  travelerType,
  arrivalDate,
  departureDate,
  budgetTier,
  interests,
  extraNotes,
  numDays,
}) {
  const relevant = filterDestinationsByInterests(interests);

  return `You are an expert Ghana travel planner who specializes in trips for diaspora returnees and international tourists. You create warm, culturally grounded, realistic itineraries.

TRIP DETAILS
- Traveler type: ${travelerType}
- Arrival: ${arrivalDate}
- Departure: ${departureDate}
- Number of days: ${numDays}
- Budget tier: ${budgetTier}
- Interests: ${interests.join(", ") || "general"}
- Extra notes: ${extraNotes || "none"}

AVAILABLE DESTINATIONS (use only these — do not invent new locations):
${JSON.stringify(relevant, null, 2)}

RULES
1. Build a realistic, well-paced itinerary across ${numDays} day(s). Do not cram too much into one day — Ghana road travel is slow.
2. Group nearby destinations on the same day (e.g., Cape Coast Castle + Elmina Castle + Kakum can be 1–2 days based on the Central Region).
3. For diaspora travelers, ALWAYS prioritize at least one heritage / slave-trade site (Cape Coast Castle, Elmina Castle, Assin Manso, W.E.B. Du Bois Centre).
4. Recommend authentic local food for each day, drawing from the destinations' signatureLocalFood fields.
5. Budget estimates should reflect the tier:
   - "budget": ~150–300 GHS/day (street food, tro-tro, hostels)
   - "mid": ~400–800 GHS/day (mid-range hotels, mix of taxi & private driver, sit-down restaurants)
   - "premium": ~1000+ GHS/day (3–4 star hotels, private driver, fine dining)
6. Include travel/transition notes between destinations (rough drive times, suggested transport).
7. Output STRICT JSON only. No markdown, no commentary, no code fences. The JSON shape must be:

{
  "summary": "2–3 sentence overview of the trip",
  "days": [
    {
      "day": 1,
      "title": "Short evocative title for the day",
      "destinationIds": ["id-1", "id-2"],
      "activities": [
        { "time": "Morning", "description": "...", "destinationId": "id-1" }
      ],
      "food": ["Specific dish recommendation 1", "Specific dish recommendation 2"],
      "transport": "How to get around today",
      "estimatedCostGHS": 0,
      "tips": "Cultural or practical tips for the day"
    }
  ],
  "budgetBreakdown": {
    "accommodationGHS": 0,
    "transportGHS": 0,
    "foodGHS": 0,
    "activitiesGHS": 0,
    "totalGHS": 0,
    "totalUSDApprox": 0
  },
  "culturalTips": ["Tip 1", "Tip 2", "Tip 3"],
  "packingNotes": "Brief packing notes specific to this itinerary"
}

Use destinationIds that exactly match the "id" field from the destinations list. Use 1 USD ≈ 12 GHS for the approximate USD conversion.`;
}

export function buildRefinementPrompt({ currentItinerary, refinementRequest }) {
  return `You previously generated this Ghana itinerary as JSON:

${JSON.stringify(currentItinerary, null, 2)}

The traveler now requests this change:
"${refinementRequest}"

AVAILABLE DESTINATIONS (only use these ids):
${JSON.stringify(destinations.map((d) => ({ id: d.id, name: d.name, region: d.region, type: d.type })), null, 2)}

Return the FULL UPDATED ITINERARY as strict JSON in the same shape as before. No markdown, no commentary, no code fences.`;
}
