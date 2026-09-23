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
