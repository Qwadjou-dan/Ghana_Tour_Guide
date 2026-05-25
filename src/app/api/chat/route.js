import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { getAkwaabaSystemPrompt } from "@/lib/akwaabaPrompt";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const contents = [
      { role: "user", parts: [{ text: getAkwaabaSystemPrompt() }] },
      { role: "model", parts: [{ text: "Understood. I am Akwaaba Guide, ready to help with Ghanaian culture, tourism, and language." }] },
      ...(history || []).flatMap((h) => [
        { role: "user", parts: [{ text: h.user }] },
        { role: "model", parts: [{ text: h.assistant }] },
      ]),
      { role: "user", parts: [{ text: message }] },
    ];

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.7,
      },
    });

    const reply = response.text;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get response" },
      { status: 500 }
    );
  }
}
