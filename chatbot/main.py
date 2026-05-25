"""Akwaaba Guide - interactive terminal chatbot.

Run from the chatbot/ folder:

    uv run main.py

The Gemini API key is read from the GEMINI_API_KEY environment variable, or
from the web app's ../.env.local if the variable is not already set. The
system prompt is loaded from ghana_chatbot_system_prompt.md so this folder is
the single source of truth for the bot's personality.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

MODEL = "gemini-2.5-flash"
HERE = Path(__file__).resolve().parent
PROMPT_FILE = HERE / "ghana_chatbot_system_prompt.md"
ENV_FILE = HERE.parent / ".env.local"

# ANSI colors for a friendlier terminal experience
GOLD = "\033[38;5;220m"
GREEN = "\033[38;5;35m"
RED = "\033[38;5;196m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def load_api_key() -> str:
    """Return the Gemini API key from the environment or ../.env.local."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "GEMINI_API_KEY":
                return value.strip().strip('"').strip("'")
    return ""


def load_system_prompt() -> str:
    """Extract the prompt between the SYSTEM PROMPT markers in the markdown."""
    fallback = (
        "You are Akwaaba Guide, a warm, friendly companion who helps people "
        "discover Ghana's culture, tourism, and language. Be welcoming, "
        "accurate, encouraging, and never invent facts."
    )
    if not PROMPT_FILE.exists():
        return fallback
    text = PROMPT_FILE.read_text(encoding="utf-8")
    match = re.search(
        r"## SYSTEM PROMPT \(copy from here.*?\)\n(.*?)\n## SYSTEM PROMPT \(copy to here",
        text,
        re.DOTALL,
    )
    return match.group(1).strip() if match else fallback


def banner() -> None:
    print()
    print(
        f"{GOLD}{BOLD}  * Akwaaba Guide {RESET}"
        f"{DIM}- your Ghana culture, travel & language companion{RESET}"
    )
    print(
        f"{DIM}  Ask me anything about Ghana. Type {RESET}{BOLD}exit{RESET}"
        f"{DIM} or press Ctrl+C to leave.{RESET}"
    )
    print(f"{DIM}  {'-' * 62}{RESET}")
    print()


def main() -> None:
    api_key = load_api_key()
    if not api_key or api_key == "paste_your_gemini_api_key_here":
        print(
            f"{RED}GEMINI_API_KEY is not set.{RESET} Add it to the project's "
            ".env.local file (or export it) and try again.",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        from google import genai
    except ImportError:
        print(
            f"{RED}The google-genai package is not installed.{RESET} "
            "Run this with `uv run main.py`, or `pip install google-genai`.",
            file=sys.stderr,
        )
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    system_prompt = load_system_prompt()

    # Mirror the web app: prime the model with the system prompt + an ack,
    # then keep appending the running conversation each turn.
    contents = [
        {"role": "user", "parts": [{"text": system_prompt}]},
        {
            "role": "model",
            "parts": [
                {
                    "text": "Understood. I am Akwaaba Guide, ready to help with "
                    "Ghanaian culture, tourism, and language."
                }
            ],
        },
    ]

    banner()

    while True:
        try:
            user_input = input(f"{GREEN}{BOLD}You > {RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print(f"\n{GOLD}Akwaaba! Safe travels - come back any time.{RESET}")
            break

        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit", ":q", "bye"}:
            print(f"{GOLD}Medaase! Until next time.{RESET}")
            break

        contents.append({"role": "user", "parts": [{"text": user_input}]})

        print(f"{GOLD}{BOLD}Guide > {RESET}", end="", flush=True)
        reply_parts: list[str] = []
        try:
            for chunk in client.models.generate_content_stream(
                model=MODEL,
                contents=contents,
                config={"temperature": 0.7},
            ):
                text = getattr(chunk, "text", None)
                if text:
                    reply_parts.append(text)
                    print(text, end="", flush=True)
            print("\n")
        except Exception as err:  # noqa: BLE001
            print(f"\n{RED}Sorry, I couldn't respond right now: {err}{RESET}\n")
            contents.pop()  # drop the unanswered user turn
            continue

        contents.append(
            {"role": "model", "parts": [{"text": "".join(reply_parts).strip()}]}
        )


if __name__ == "__main__":
    main()
