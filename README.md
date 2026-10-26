## Current access behavior (October 26, 2026)

Browsing and submitting ratings require no login. Apply `supabase/guest-ratings.sql` after the existing Assignment 7 migrations. Guest votes use a high-entropy HTTP-only cookie, store only its SHA-256 digest in the database, and allow one immutable vote per caption/browser identity plus up to 60 new votes per hour. Clearing cookies or using another browser creates a new identity; this is not one-person-one-vote enforcement. Anonymous callers cannot read rating rows, profiles or generation history; narrow RPCs submit ratings and retrieve only receipts for the supplied secret identity. Existing signed-in ratings and admin statistics use the same table.

Google login is still used for caption creation, private history and optional avatar changes. It returns directly home without requesting first/last names. No name-completeness gates remain. The separate administrator app still requires Google and `profiles.is_superadmin`.

# NYC, According to AI — public captions and guest ratings

A NYC humor community for a Columbia student exploring the city. A signed-in user supplies a place and an experience, Gemini creates a caption, and the app saves it for others to rate. Votes rate **the AI caption’s humor**, not the venue.

## Finish setup

1. In the **existing Supabase project**, run `supabase/assignment4.sql` in SQL Editor after the Assignment 3 migration. It creates private `generations`, public `captions`, and private `caption_votes`, with RLS and narrowly scoped insert grants. It also enables RLS on every public application table. Tables without policies deny client access. Existing profile and avatar policies remain in effect.
2. Get a Gemini API key from https://aistudio.google.com/apikey. Add `GEMINI_API_KEY=your_key` to `.env.local`. Never commit it or prefix it with `NEXT_PUBLIC_`. Leave the existing Supabase URL and anon key in place. `GEMINI_MODEL=gemini-3.5-flash-lite` is optional; override it with a model supported by your API project. Model availability and quotas depend on Google. The integration uses the documented [generateContent REST API](https://ai.google.dev/api/generate-content).
3. Restart `npm run dev` and open http://localhost:3000. Use a supported model/key to verify a real generation; no example captions are passed off as AI output.
4. Add the same Gemini variables to Vercel’s target environment before deploying. Disable **Settings → Deployment Protection → Vercel Authentication** for the submission as the assignment requires. Confirm the final deployment works in incognito. Existing Google OAuth/Supabase callback allowlists still need the exact submitted deployment origin (see Assignment 3 below).

## Current routes and behavior

- `/`: public latest-caption preview; all visitors rate rounds of up to five captions from the latest 60. Already-rated captions are skipped. Only confirmed database writes advance progress; each round ends with a personal recap.
- `/create`: protected generation form. Place, experience, and caption are published together; full prompts remain private. Disabled until both the migration and server AI key are available.
- `/members`: protected notebook of the latest 30 generation attempts with model and exact prompt. Failed attempts remain in history and count toward request limits.
- `/profile`, `/login`, `/auth/callback`: Google sign-in with a direct return to home; optional profile photo.

The server verifies the authenticated user in **each mutation** and never takes user IDs from the form. The database enforces one immutable vote per user/caption, caption-to-generation ownership, server-owned IDs/timestamps, and at most 10 generation attempts per rolling 24 hours, at least 30 seconds apart. RLS restricts prompt and vote reads to their owner. No service-role key is used. One caption is allowed per generation request; generations are saved before calling AI, so failed attempts can be inspected. AI errors, blocked responses, truncation, and save failures never become published placeholder content. Input stories and saved prompts go to Google Gemini for generation; privacy text explains this.

## Validation and PM feedback

Run `npm run lint`, `npm test`, and `npm run build`. The tests use in-memory PostgreSQL with non-owner roles to exercise the actual migration twice, RLS, foreign keys, uniqueness, immutability, and quota limits. They never contact or change your Supabase database. AI tests mock provider responses; they do not prove a live key works.

After configuration, check with real accounts:

1. Signed out: view public captions; direct `/create` and `/members` visits redirect to login; generation and voting mutations reject unauthenticated requests.
2. Signed in: publish a real caption and inspect its saved prompt in My captions. Reload to confirm persistence.
3. Rate captions in a round, confirm success feedback, then reload. Saved votes should remain and not appear again. Confirm one database row per user/caption.
4. With a second account, confirm it can vote independently but cannot read the first user’s prompt or votes, create content under their account, or modify their records.
5. Force an invalid AI key/quota response or a failed save: errors must be clear, the form becomes usable again, and no fake caption is published.
6. Try mobile and keyboard navigation. Ask the PM whether the voting target, publication visibility, loading feedback, and round recap are understandable. Record feedback and iterate before submission.

Intentional scope: recognizable NYC categories and personal experiences give the AI specific material; short rating rounds and a recap reward participation. The app avoids external GIF failures by using text captions. It does not invent venue details, claim verified recommendations, or add unrelated maps, star reviews, points, or leaderboards.

---

# Earlier assignments: My Favorite Movies

Assignment 2 extends the Assignment 1 Next.js app with a movie list read from Supabase.

## Setup

1. Install dependencies with `npm ci`.
2. In a new Supabase project, run `supabase/setup.sql` once. It creates the movies table, inserts three sample movies, and grants anonymous read-only access with row-level security enabled.
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY` using your project URL and legacy anon key. Do not use a service-role key. `.env.local` is ignored by Git.
4. Run `npm run dev` and open http://localhost:3000.

The server reads movie rows through the Supabase REST API on every page request. The page displays movie titles, genres, and ratings, with separate empty and error states.

## Validation

Run `npm run lint` and `npm run build`.

## Vercel deployment

Use the existing GitHub-connected Vercel project. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel for the target environment before deploying. Push to main to trigger a new production deployment, or redeploy after changing environment variables.

For assignment submission, use the unique deployment URL associated with the submitted commit. Verify that it shows the movie list without requiring a Vercel login in an incognito window.

## Assignment 3: Google login and profiles (historical setup; name onboarding removed)

Use the existing Supabase and Vercel projects. The app uses the same `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables as assignment 2. No service-role key or Google client secret belongs in the app.

1. Run `supabase/assignment3.sql` in your existing Supabase SQL Editor. It creates nullable first/last names, an `auth.users` insert trigger, backfills existing users, and creates an avatars Storage bucket. RLS limits profile writes and avatar uploads to the signed-in user.
2. In Google Cloud's Google Auth Platform, configure Branding and Audience for your own application. While in Testing, add your Google account as a test user. Create an OAuth client of type **Web application**.
3. Set Authorized JavaScript origins to `http://localhost:3000` and your production app origin (`https://design-genai-hello-world.vercel.app`, if this is the domain shown in your Vercel project). Add each deployment origin you plan to use for login.
4. Google's Authorized redirect URI is **the Supabase provider callback**: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`. Copy the exact value from Supabase Authentication → Sign In / Providers → Google. Save your client ID and client secret in that Google provider form, and enable it.
5. In Supabase Authentication → URL Configuration, set Site URL to your production app origin. Add `http://localhost:3000/auth/callback` and `https://YOUR_PRODUCTION_DOMAIN/auth/callback` to Redirect URLs. Add the final commit-specific deployment's exact `/auth/callback` URL too when Vercel creates it.
6. The application's `redirectTo` is always its current origin plus `/auth/callback`, with no custom query parameters. Supabase adds the standard authorization `code` to return to that endpoint. The callback exchanges it for a cookie session, then sends incomplete profiles to `/profile` and complete profiles to `/members`.
7. Check Vercel Settings → Deployment Protection and disable protection for the submitted deployment, as required by the assignment.

Google's provider callback and the app's callback are two different steps in the OAuth flow. The app never requests extra Google API permissions.

### Routes

- `/`: public movie list, with a signed-out invitation or signed-in members card.
- `/login`: Google OAuth sign-in.
- `/auth/callback`: code exchange only.
- `/profile`: authenticated profile editing; first and last names are required by the form but nullable in the database. Photos are optional, validated JPG/PNG/WebP files of up to 2 MB stored in Supabase Storage.
- `/members`: server-protected members' corner, requires login and complete names.

### Submission verification

- Run `npm run lint` and `npm run build`.
- In an incognito window, `/members` and `/profile` must redirect to `/login`; the homepage must still display all three movies.
- Sign in using a new Google account. Verify one profile row is created automatically, with null names before onboarding.
- Save both names; verify the homepage and `/members` work and a fresh sign-in no longer prompts for names.
- Upload a photo and replace it. Reload `/profile` to confirm persisted names and photo; inspect Storage to confirm the object and inspect `profiles.avatar_path` to confirm only a path is stored.
- Sign out, then directly revisit `/members`; its content must be unavailable.
- Submit the unique Vercel deployment URL associated with the final Git commit, after adding that origin's exact `/auth/callback` URL to Supabase's allow list.
