import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { GoogleButton } from "@/components/google-button";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user, profile } = await getAccount();
  if (user) redirect(isComplete(profile) ? "/members" : "/profile");
  const { error } = await searchParams;
  return <main className="collection"><Navigation signedIn={false} />
    <p className="eyebrow">YOUR SEAT IS SAVED</p><h1>Welcome to the shelf<span>.</span></h1>
    <p className="intro">Sign in to set up your profile and explore our members’ corner.</p>
    <section className="panel" aria-label="Sign in">
      <h2>A little more personal.</h2><p>Use your Google account to join. We’ll ask for your first and last name after sign-in.</p>
      {error && <p className="message error" role="alert">Sign-in didn’t finish. Please try again. If it keeps happening, the Google login settings may need updating.</p>}
      <form action={signInWithGoogle}><GoogleButton /></form>
      <Link className="back-link" href="/">← Back to the movies</Link>
    </section>
  </main>;
}
