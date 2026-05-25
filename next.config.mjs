import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // The /api/chat route reads the persona from chatbot/ghana_chatbot_system_prompt.md
  // at runtime. Next.js doesn't trace plain markdown automatically, so without this
  // the file is missing from the deployed serverless bundle and the chatbot quietly
  // falls back to the short prompt. This makes sure the file ships with the function.
  outputFileTracingIncludes: {
    "/api/chat": ["./chatbot/ghana_chatbot_system_prompt.md"],
  },
};

export default nextConfig;
