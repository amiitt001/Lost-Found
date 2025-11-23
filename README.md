<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UX-lWyOM2hreEc_Esa_UoewX6Jy7m2r7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the server-side API (it keeps your Gemini key on the server):

   ```
   npm run serve-api
   ```

4. In a separate terminal, run the frontend dev server:

   ```
   npm run dev
   ```

Note: If you previously built or deployed the app while using a `VITE_GEMINI_API_KEY`, that key may be embedded in the published JS. If your key was exposed, rotate it immediately and stop using client-side env vars for secrets.

If you deploy the frontend to a static host (e.g. Vercel) and the server API is hosted separately, set the `VITE_API_BASE` env var for the frontend build to point at your API origin (for example `https://api.example.com`). If the API is deployed alongside the frontend under `/api`, no extra configuration is required.

## Firebase setup (optional)

1. Copy `.env.local.example` to `.env.local` and fill in your Firebase values.
2. The app expects the following Vite env variables (prefixed with `VITE_`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

3. Do NOT commit `.env.local` (it's listed in `.gitignore`).
