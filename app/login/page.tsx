import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { GoogleButton } from "@/components/google-button";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user } = await getAccount();
  if (user) redirect("/");
  const { error } = await searchParams;
  return <main className="collection"><Navigation signedIn={false} />
    <p className="eyebrow">YOUR CITY. YOUR SENSE OF HUMOR.</p><h1>Join the conversation<span>.</span></h1>
    <p className="intro">Sign in to create AI captions and keep your private generation history. Browsing and rating need no login.</p>
    <section className="panel" aria-label="Sign in">
      <h2>A little more personal.</h2><p>Continue with Google and you’re ready to go. No name form to fill out.</p>
      {error && <p className="message error" role="alert">Sign-in didn’t finish. Please try again. If it keeps happening, the Google login settings may need updating.</p>}
      <form action={signInWithGoogle}><GoogleButton /></form>
      <Link className="back-link" href="/">← Back to the captions</Link>
    </section>
  </main>;
}
