<!-- <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UX-lWyOM2hreEc_Esa_UoewX6Jy7m2r7 -->

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

Vercel deploy checklist
1. Commit and push your branch to the repo connected to Vercel.
2. In Vercel project settings > Environment Variables, add `GEMINI_API_KEY` (Production) with your key.
3. Ensure the `api/` folder is included in the repository root (we added `api/analyze.js` and `api/match.js`). Vercel will automatically build these as serverless functions and expose them under `/api/*`.
4. If you host the API separately, set `VITE_API_BASE` in Vercel's environment variables to point to your API origin.
5. Redeploy the project.

If you previously deployed with `VITE_GEMINI_API_KEY` or you published a build that included your key, rotate the key immediately.

### Rotating a leaked Gemini API key
If you see errors like `PERMISSION_DENIED` or the server logs indicate the key was reported as leaked, rotate the key immediately and update your deployment.

1. Go to your GenAI/Google Cloud console and revoke/delete the exposed API key (or create a new key if rotation UI differs).
2. In Vercel dashboard -> Project -> Settings -> Environment Variables, replace the `GEMINI_API_KEY` value with the new key (do not use `VITE_` prefix).
3. Redeploy your Vercel project so serverless functions run with the new key.
4. Verify by opening your site and triggering an analyze/match action — network requests to `/api/analyze` and `/api/match` should return 200.

If you committed the key into your repository history, consider rotating keys for safety and follow the provider's guidance for compromised keys. You may also remove the key from your git history using tools like `git filter-repo` or BFG, but note this rewrites history and affects collaborators.

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

## Deploy Firebase Rules

This project includes `storage.rules` and `firestore.rules` to enforce upload paths and privacy for FOUND items.

1. Install Firebase CLI and log in (if not already):

```bash
npm install -g firebase-tools
firebase login
```

2. Select or add your Firebase project (run inside project folder):

```bash
firebase use --add
```

3. Deploy Storage rules (ensures uploads are allowed only into `reports/{uid}/...`):

```bash
firebase deploy --only storage
```

4. Deploy Firestore rules (enforces FOUND item visibility and moderation rules):

```bash
firebase deploy --only firestore:rules
```

5. Verify behavior:
- Sign in as a test user and submit a report with image; the upload path should be `reports/{yourUid}/...` and should NOT return 403.
- If you have pending queued reports, sign in with the same account that created them then go online to let the app flush the queue.

If you prefer server-generated signed upload URLs instead of client writes, I can add a secure endpoint that returns short-lived upload URLs and adjust the client accordingly.

## Optional: Local Flask seating service

This repo includes a small example Flask service that can parse an uploaded XLSX/XLS and produce seating plans.

- File: `backend/app.py`
- Requirements: `backend/requirements.txt`

Run locally (in `cmd.exe`):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

API endpoints:
- `POST /upload` - multipart form file upload (key `file`). Returns `data_id`.
- `POST /calculate` - JSON body `{ "data_id": "<id>", "pattern": "standard" }` returns seating plan and unallocated list.

Example usage (curl):

```bash
curl -F "file=@/path/to/seating.xlsx" http://127.0.0.1:5000/upload

curl -H "Content-Type: application/json" -d '{"data_id":"1","pattern":"snake"}' http://127.0.0.1:5000/calculate
```
