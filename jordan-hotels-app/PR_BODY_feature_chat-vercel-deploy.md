Title: Add Vercel chat proxy, CI workflow, and runtime-config placeholder

Description:
- Adds a Vercel/Netlify serverless chat proxy at `serverless-vercel-chat/api/chat.js`.
- Adds a GitHub Action `.github/workflows/deploy-vercel-chat.yml` to auto-deploy the proxy to Vercel.
- Updates the frontend to prefer an external chat URL (`src/services/chatService.js`) and adds a `VITE_CHAT_API_URL` placeholder in `public/runtime-config.js`.

Why:
Provide a low-friction OpenAI-backed chat backend (avoids ongoing SAM/API Gateway deployment issues) while keeping a local fallback.

Next steps:
1. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to this repo's GitHub secrets.
2. Set `OPENAI_API_KEY` in the Vercel project.
3. Merge this branch to trigger the GitHub Action and deploy the proxy.
4. After deploy, set `VITE_CHAT_API_URL` in runtime config to the deployed function URL and test the chat UI.

Testing:
- After deployment, open the app and verify chat responses come from the external API. If no external URL is set, the app falls back to the local generator.

Notes:
- A PR was pushed for branch `feature/chat-vercel-deploy`. If you want me to open the PR directly, provide a GitHub token with `repo` scope or allow me to use the `gh` CLI in this environment.
