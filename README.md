# My Favorite Movies

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

## Assignment 3: Google login and profiles

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
