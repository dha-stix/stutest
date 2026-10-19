# Stutest

Turn any topic or document into timed multiple-choice tests, flip flashcards, fill-in-the-gap drills, key points and a document chat — powered by each student's own Claude, ChatGPT or Grok API key.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore) and Motion.

Built by [David Asaolu](https://www.linkedin.com/in/david-asaolu234/).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Firebase config the app runs in **demo mode**: sign-in creates a local demo student and all data stays in the browser's localStorage. Everything else (including real AI generation with a real key) works the same.

## Connect Firebase

1. Create a Firebase project, add a **Web app**, and enable **Authentication → Sign-in method → Google**.
2. Create a **Firestore** database.
3. Copy `.env.example` to `.env.local` and fill in the `NEXT_PUBLIC_FIREBASE_*` values from the web app config.
4. Deploy the security rules in [`firestore.rules`](firestore.rules) (Firebase console → Firestore → Rules, or `firebase deploy --only firestore:rules`).
5. Add your production domain under Authentication → Settings → Authorized domains.

Restart `npm run dev` — demo mode switches off automatically once the config is present.

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
- **Documents**: PDF and DOCX are parsed **in the browser** (`lib/documents.ts`). Only the first 5 pages are kept (DOCX pages are estimated at 500 words); the UI shows which pages were cut.
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
