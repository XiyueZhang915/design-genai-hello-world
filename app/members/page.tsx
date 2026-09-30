import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";

export default async function Members() {
  const { profile } = await requireAccount();
  if (!isComplete(profile)) redirect("/profile");
  return <main className="collection"><Navigation signedIn />
    <p className="eyebrow">MEMBERS’ CORNER</p><h1>Your next movie night<span>.</span></h1>
    <p className="intro">Welcome, {profile?.first_name}. You’re among friends who love a good story.</p>
    <section className="panel"><p className="genre">TONIGHT’S DOUBLE FEATURE</p>
      <h2>Big questions. Bigger worlds.</h2><p>Start with Interstellar for a journey through space, then switch to Zootopia for a city full of surprises.</p>
      <p className="member-note">A conversation starter: which world would you want to spend a day in, and why?</p>
      <Link className="button" href="/">Explore the movie shelf →</Link>
    </section>
    <footer>This corner is available to signed-in members.</footer>
  </main>;
}
