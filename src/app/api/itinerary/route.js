import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { buildItineraryPrompt, buildRefinementPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

function daysBetween(arrival, departure) {
  const a = new Date(arrival);
  const d = new Date(departure);
  const ms = d.getTime() - a.getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

function extractJson(text) {
  if (!text) throw new Error("Empty response from Gemini");
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw err;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode } = body;

    let prompt;
    if (mode === "refine") {
      const { currentItinerary, refinementRequest } = body;
      if (!currentItinerary || !refinementRequest) {
        return NextResponse.json(
          { error: "currentItinerary and refinementRequest are required for refinement" },
          { status: 400 }
        );
      }
      prompt = buildRefinementPrompt({ currentItinerary, refinementRequest });
    } else {
      const {
        travelerType,
        arrivalDate,
        departureDate,
        budgetTier,
        interests,
        extraNotes,
      } = body;
      if (!arrivalDate || !departureDate) {
        return NextResponse.json(
          { error: "arrivalDate and departureDate are required" },
          { status: 400 }
        );
      }
      const numDays = daysBetween(arrivalDate, departureDate);
      prompt = buildItineraryPrompt({
        travelerType: travelerType || "international tourist",
        arrivalDate,
        departureDate,
        budgetTier: budgetTier || "mid",
        interests: interests || [],
        extraNotes: extraNotes || "",
        numDays,
      });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text;
    const itinerary = extractJson(text);

    return NextResponse.json({ itinerary });
  } catch (err) {
    console.error("Itinerary route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
