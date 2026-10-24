# CampusPulse

CampusPulse is a student-facing campus community demo for discovering events and clubs while retaining the existing campus issue tracker and AI-generated Bangla issue summaries.

## What is included

- Home dashboard with upcoming demo events, sample clubs, event-derived announcements, and campus issues.
- Event search across titles, organizers, descriptions, and venues; category, status, date-range, and sort filters.
- Event detail views with save and Interested/Going actions, external registration links, share, and `.ics` calendar download.
- Club directory with search, category filters, linked sample events, and a club-listing request notice.
- My Activities for browser-local event bookmarks, RSVPs, event submissions, and issues submitted in this browser.
- Event submission validation and a Pending Review state. A demo-only review control is explicitly unauthenticated.
- Existing issue feed, report form, voting, comments, filters, issue details, and AI summaries.

Sample event and club data is illustrative and is **not verified university information**. Sample response totals are demo counts, not live registrations.

## Development setup

The repository includes a Bun lockfile. Install Bun, then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The Express server runs the Vite app and exposes `POST /api/campus-summary`.

Alternatively, npm can be used:

```sh
npm install
npm run dev
```

Quality checks:

```sh
npm test
npm run lint
npm run build
```

## AI summary configuration

AI requests are sent to a server-side endpoint; never put an API key in a `VITE_*` variable or browser code. Set either `GEMINI_API_KEY1` (preferred by the existing server configuration) or `GEMINI_API_KEY` in the local `.env` file or deployment environment. Both are optional: the endpoint returns a clearly marked demo fallback when no key is configured.

The server uses the existing Google GenAI SDK and the configured model identifier `gemini-3.8-flash`. The model is not silently changed by the client. AI provider errors are logged server-side and fall back to the existing demo summary behavior.

## Vercel deployment

The Vite frontend builds to `dist/`; the `/api/campus-summary` serverless function is in `api/campus-summary.ts` and shares its server-only implementation with the local Express route.

1. Import the repository into Vercel and use the Vite framework preset (build command `npm run build`, output directory `dist`).
2. Add `GEMINI_API_KEY1` or `GEMINI_API_KEY` in the Vercel project’s server-side environment variables if live AI summaries are wanted.
3. Deploy. The browser-only events, clubs, RSVPs, and issues work without a database; AI summary calls use the Vercel API function.

Vercel Functions impose a request-size ceiling. Large issue-photo payloads may exceed that limit; text summaries and smaller images are supported, while local Express development accepts larger JSON payloads.

## Demo and production limitations

All event bookmarks, RSVPs, event submissions, and issue data are stored in local storage. They are local to the current browser profile, can be cleared or edited by the user, and do not provide accounts, cross-device sync, shared event counts, or secure one-vote-per-student enforcement. The sample review action is not access controlled; it is a demonstration only and must not be used for real approvals.

For production, connect the application to a persistent backend such as Supabase, Firebase, or an equivalent service. Add authenticated student and organizer identities, server-side validation, moderation and access-controlled event review, durable shared data, and appropriate privacy/retention controls before treating listings, votes, or announcements as official.

## Technology

React 19, TypeScript, Vite 8, Tailwind CSS 4, Express, Google GenAI SDK, and Lucide icons.
