# Deploying Akwaaba AI to Vercel

This guide covers deploying the Next.js web app to Vercel. The terminal chatbot
in `chatbot/` is a local-only tool — it does **not** run on Vercel and does not
need to (the deployed site uses the web chat API route instead).

## Before you start

You need:

- A [GitHub](https://github.com) account with this project pushed to a repo.
- A [Vercel](https://vercel.com) account (free tier is fine).
- Your Gemini API key (the value currently in `.env.local`).

> **Important:** `.env.local` is git-ignored (see `.gitignore`), so your API key
> is **not** pushed to GitHub. You must add it manually in Vercel (step 3 below),
> otherwise both the chatbot and the itinerary generator will fail in production.

## Deploy via the Vercel dashboard (recommended)

1. **Push to GitHub.** Commit everything and push to a GitHub repository.

   ```bash
   git add .
   git commit -m "Prepare for deploy"
   git push
   ```

2. **Import the project.** Go to [vercel.com](https://vercel.com) →
   **Add New → Project** → select your GitHub repo. Vercel auto-detects Next.js,
   so you can leave the build settings at their defaults.

3. **Add the API key.** In the import screen (or later under
   **Settings → Environment Variables**), add:

   | Name             | Value                  | Environments                      |
   | ---------------- | ---------------------- | --------------------------------- |
   | `GEMINI_API_KEY` | *(your Gemini key)*    | Production, Preview, Development   |

4. **Deploy.** Click **Deploy**. Vercel builds the app on its own Linux machines
   and gives you a live URL when it finishes.

## Deploy via the Vercel CLI (alternative)

```bash
npm i -g vercel        # install once
vercel                 # link + deploy a preview
vercel env add GEMINI_API_KEY   # paste your key when prompted
vercel --prod          # promote to production
```

## Why `next.config.mjs` includes `outputFileTracingIncludes`

The `/api/chat` route reads the chatbot's persona from
`chatbot/ghana_chatbot_system_prompt.md` at runtime. Next.js does not
automatically bundle plain markdown files into serverless functions, so the
config explicitly tells it to ship that file with the `/api/chat` function:

```js
outputFileTracingIncludes: {
  "/api/chat": ["./chatbot/ghana_chatbot_system_prompt.md"],
},
```

Without this, the deployed chatbot would quietly fall back to a short built-in
prompt instead of the full Akwaaba Guide persona. Leave this in place.

## After deploying

- Every push to your default branch triggers a new production deploy.
- Pushes to other branches / pull requests get their own preview URLs.
- If you change the API key, update it in **Settings → Environment Variables**
  and redeploy.

## Troubleshooting

- **Chatbot or itinerary returns an error in production** — the `GEMINI_API_KEY`
  env var is probably missing or misspelled in Vercel. Check
  **Settings → Environment Variables**, then redeploy.
- **Chatbot replies feel generic / off-persona** — the markdown prompt didn't get
  bundled. Confirm `outputFileTracingIncludes` is still in `next.config.mjs`.
- **Build fails on Vercel** — open the build logs in the Vercel dashboard; the
  error message there points to the cause. (The SWC binary error you may have
  seen locally in a sandbox does not occur on Vercel's build machines.)
