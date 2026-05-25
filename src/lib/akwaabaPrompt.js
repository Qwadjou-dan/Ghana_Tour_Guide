import fs from "node:fs";
import path from "node:path";

// Single source of truth for the Akwaaba Guide personality. The web chatbot
// and the terminal chatbot (chatbot/main.py) both read this same markdown file,
// so editing the markdown updates both.
const PROMPT_FILE = path.join(
  process.cwd(),
  "chatbot",
  "ghana_chatbot_system_prompt.md"
);

// Used only if the markdown file can't be read (e.g. it isn't bundled in a
// serverless deployment). Keeps the chatbot working instead of crashing.
const FALLBACK_PROMPT =
  "You are Akwaaba Guide, a warm, friendly companion who helps people " +
  "discover Ghana's culture, tourism, and language. Be welcoming, accurate, " +
  "encouraging, and never invent facts.";

let cachedPrompt = null;

function extractPrompt(markdown) {
  // Grab the text between the "copy from here" and "copy to here" markers.
  const match = markdown.match(
    /## SYSTEM PROMPT \(copy from here.*?\)\n([\s\S]*?)\n## SYSTEM PROMPT \(copy to here/
  );
  return match ? match[1].trim() : null;
}

export function getAkwaabaSystemPrompt() {
  if (cachedPrompt) return cachedPrompt;
  try {
    const markdown = fs.readFileSync(PROMPT_FILE, "utf8");
    cachedPrompt = extractPrompt(markdown) || FALLBACK_PROMPT;
  } catch {
    cachedPrompt = FALLBACK_PROMPT;
  }
  return cachedPrompt;
}
