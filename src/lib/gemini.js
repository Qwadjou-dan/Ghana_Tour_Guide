import { GoogleGenAI } from "@google/genai";

let cachedClient = null;

export function getGeminiClient() {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "paste_your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

export const GEMINI_MODEL = "gemini-2.5-flash";
