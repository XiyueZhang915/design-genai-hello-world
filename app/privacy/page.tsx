import Link from "next/link";

export default function Privacy() {
  return <main className="collection"><p className="eyebrow">THE MOVIE SHELF</p>
    <h1>Privacy<span>.</span></h1><p className="intro">Updated September 30, 2026. The Movie Shelf is a class project featuring movies, Google sign-in, and member profiles.</p>
    <section className="panel"><h2>Information we use</h2><p>Google sign-in shares your account identifier, email address, and basic profile information with our authentication provider, Supabase. We use this to sign you in. We store the first and last names you enter and the storage path of your uploaded profile photo to display and edit your profile.</p>
    <h2>Storage and access</h2><p>Supabase provides authentication, database storage, and photo storage. Vercel hosts the website. Session cookies keep you signed in, and these providers may process technical request logs to operate their services. Profile photos are stored in a public storage bucket: anyone who has a photo’s URL can view it. Please choose a photo you are comfortable sharing.</p>
    <h2>Your choices</h2><p>You can edit your names and replace your photo in Profile, or sign out. To request deletion of your account and stored profile data, contact <a href="mailto:bettyzh915@gmail.com">bettyzh915@gmail.com</a>. Data remains stored until deleted. This app does not sell your profile data or use it for advertising.</p></section>
    <Link className="back-link" href="/">← Back to the movies</Link></main>;
}
