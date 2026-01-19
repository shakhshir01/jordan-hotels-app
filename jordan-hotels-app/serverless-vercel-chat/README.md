Deploying the VISIT-JO Chat function to Vercel or Netlify

Overview
- This folder contains a minimal serverless chat proxy suitable for Vercel (Serverless Functions) or Netlify Functions.
- It forwards a POST {query, history} to OpenAI and returns structured JSON.

Vercel
1. Create a new Vercel project and point it to this repository (or copy the `api/chat.js` file into your Vercel project's `api/` folder).
2. Set an Environment Variable `OPENAI_API_KEY` in the Vercel dashboard (Project Settings > Environment Variables).
3. Deploy. The function will be available at `https://<your-vercel-app>.vercel.app/api/chat`.

GitHub Action (automatic deploy)
- This repo includes a GitHub Actions workflow at `.github/workflows/deploy-vercel-chat.yml` that will deploy the `serverless-vercel-chat` folder to Vercel on pushes to `main`.
- Add these repository secrets in GitHub Settings > Secrets for the workflow to work:
  - `VERCEL_TOKEN` — your Vercel personal token.
  - `VERCEL_ORG_ID` — your Vercel Org (or Team) ID.
  - `VERCEL_PROJECT_ID` — the Vercel Project ID for the deployed project.

Notes:
- The workflow uses `amondnet/vercel-action` and deploys with `--prod` when triggered.
- You still need to set `OPENAI_API_KEY` in Vercel's project environment variables (Vercel UI) so the function can call OpenAI.

Netlify
1. Create a Netlify Function using the same `api/chat.js` code (Netlify expects `netlify/functions/chat.js` and a small wrapper).
2. Set `OPENAI_API_KEY` in Netlify's Environment Variables.
3. Deploy. The function will be at `https://<your-netlify-site>/.netlify/functions/chat`.

Frontend integration
- Add the function URL to your runtime config (`public/runtime-config.js`) as `VITE_CHAT_API_URL`:

window.__VISITJO_RUNTIME_CONFIG__ = {
  ...,
  VITE_CHAT_API_URL: "https://<your-vercel-app>.vercel.app/api/chat",
};

- The frontend `src/services/chatService.js` will prefer `VITE_CHAT_API_URL` if present.

Security
- Keep `OPENAI_API_KEY` secret in the host environment variables; do not commit keys to the repo.

Notes
- Vercel supports global `fetch` in Node 18+; this function uses it and has no extra deps.
- If you prefer, I can add a small GitHub Action to automatically deploy this when pushing to a branch.
