# Stutest

Turn any topic or document into timed multiple-choice tests, flip flashcards, fill-in-the-gap drills, key points and a document chat — powered by each student's own Claude, ChatGPT or Grok API key.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore) and Motion.

Built by [David Asaolu](https://www.linkedin.com/in/david-asaolu234/).

## Set up Firebase

1. In the [Firebase console](https://console.firebase.google.com) create a project, then add a **Web app** (Project settings → Your apps → `</>`).
2. **Authentication** → Get started → Sign-in method → enable **Google**.
3. **Firestore Database** → Create database (production mode, pick a region).
4. Open `.env.local` (copied from `.env.example`) and paste the six `NEXT_PUBLIC_FIREBASE_*` values from the web app's config.
5. Deploy the security rules (once):

   ```bash
   firebase login
   firebase use --add        # pick your project
   firebase deploy --only firestore:rules
   ```

   Or paste `firestore.rules` into Firestore → Rules in the console.
6. When you deploy the site, add its domain under Authentication → Settings → Authorized domains (`localhost` is allowed by default).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. If the Firebase values are missing, the sign-in page says so and the button is disabled.

All reads and writes go through [`lib/firebase-actions.ts`](lib/firebase-actions.ts); [`lib/firebase.ts`](lib/firebase.ts) initialises the SDK.

### Data model

| Path | Contents |
| --- | --- |
| `users/{uid}` | Profile (name, email, photo) |
| `users/{uid}/private/settings` | AI provider, API key, last 4 chars, verified time |
| `packs/{packId}` | Generated pack (`uid`, title, source, MCQ sections, decks, gap sections, key points, document text) |
| `packs/{packId}/attempts/{id}` | Scored MCQ / fill-gap attempts |
| `packs/{packId}/chats/main` | Chat history |

## How generation works

- **Keys**: the student pastes a key on `/settings/api-key`; `/api/verify-key` makes a cheap authenticated call (list models) and rejects bad keys immediately.
- **Documents**: PDF and DOCX are parsed **in the browser** (`lib/documents.ts`). Up to 20 pages or 10,000 words are kept, whichever comes first (DOCX pages are estimated at 500 words); the UI shows which pages were cut. The multiple-choice count is capped at about 8 questions per page so packs don't become repetitive, and the create page shows the number of AI requests and an estimated token total, since every request resends the document.
- **Packs**: `lib/generate.ts` calls `/api/generate` once per batch of at most 50 items. MCQ sections are generated in sequence, each told which questions already exist so sections don't repeat. A 150-question request becomes 3 sections of 50.
- **Timing**: each section's timer comes from the reading length of its questions (`lib/study.ts → questionSeconds`).
- **Models** (server-side, in `lib/ai/providers.ts`): Claude uses `claude-opus-5-5` with server-side refusal fallback enabled; ChatGPT uses `gpt-5`; Grok uses `grok-4` via xAI's OpenAI-compatible API. Override with `CLAUDE_MODEL`, `OPENAI_MODEL`, `GROK_MODEL`.

Students' keys are stored in their own Firestore document (owner-only rules) and sent to the AI provider only through the API routes when they generate or chat. If you prefer keys never to be readable by the client after saving, move them into a server-side store (e.g. Cloud Functions + Secret Manager) and have the API routes look them up with the Firebase Admin SDK.

## Project structure

```
app/                  Routes (pages + /api route handlers)
components/
  marketing/          Homepage sections
  auth/               Login / register screens
  app/                AppShell (sidebar), StudyShell (focus mode), auth guard
  dashboard/ create/ packs/ settings/ study/   Page features
  svg/                Small animated SVG icons
  ui/                 Buttons, pills, notices, spinners, logo
images/               Animated SVG illustrations used on the homepage
lib/                  Types, constants, Firebase, AI, document parsing, PDF export
styles/animations.css Shared keyframes and animation classes
firestore.rules       Firestore security rules
```
