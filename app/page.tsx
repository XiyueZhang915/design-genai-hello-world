import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { RatingDeck } from "@/components/rating-deck";
import { connection } from "next/server";
import { type Caption } from "@/lib/humor";

export default async function Home() {
  await connection();
  const { supabase, user, profile } = await getAccount();
  if (user && !isComplete(profile)) redirect("/profile");
  const { data, error } = await supabase.from("captions")
    .select("id,place,category,experience,caption,created_at").order("created_at", { ascending: false }).order("id").limit(60);
  const captions = (data || []) as Caption[];
  const votes = user && captions.length ? await supabase.from("caption_votes").select("caption_id").eq("user_id", user.id).in("caption_id", captions.map(caption => caption.id)) : null;
  return <main className="collection nyc-home"><Navigation signedIn={Boolean(user)} />
    <header className="city-hero"><p className="eyebrow">NEW YORK MOMENTS. AI PUNCHLINES. YOUR VERDICT.</p>
      <h1>Big city.<br />Small inconveniences<span>.</span></h1>
      <p className="intro">The café essay that never got written. The subway ride that became a side quest. Turn everyday NYC into a caption worth laughing at.</p>
      <div className="hero-actions"><Link className="button" href={user ? "/create" : "/login"}>Turn your moment into a joke →</Link><a className="outline-button" href="#rate">{user ? "Rate some captions ↓" : "Explore the captions ↓"}</a></div>
      <div className="city-strip" aria-label="Themes"><span>01 / COFFEE SHOPS</span><span>02 / RESTAURANTS</span><span>03 / LANDMARKS</span><span>04 / AROUND CAMPUS</span></div>
    </header>
    <section id="rate" className="rating-section" aria-labelledby="rating-title"><p className="eyebrow">THE HUMAN PART OF AI HUMOR</p><h2 id="rating-title">{user ? `Your call, ${profile?.first_name}.` : "Does the joke land?"}</h2>
      <p className="section-intro">Rate the AI caption, not the venue. A few honest reactions go a long way.</p>
      {error?.code === "PGRST205" ? <div className="notice" role="status"><h3>The caption community is opening soon.</h3><p>We’re getting the collection ready. You can sign in and set up your profile in the meantime.</p><Link className="button" href={user ? "/profile" : "/login"}>{user ? "Visit your profile →" : "Sign in →"}</Link></div>
        : error || votes?.error ? <div className="notice" role="alert"><h3>The captions couldn’t load.</h3><p>Please try again shortly.</p><form action="/" method="get"><button className="outline-button" type="submit">Try again →</button></form></div>
        : captions.length === 0 ? <div className="notice"><h3>The city has stories. We’re waiting for yours.</h3><p>No published captions yet. Be the first to turn a NYC moment into a joke.</p><Link className="button" href={user ? "/create" : "/login"}>{user ? "Create the first caption →" : "Sign in to create →"}</Link></div>
        : user ? <RatingDeck captions={captions} votedIds={votes?.data?.map(vote => vote.caption_id) || []} />
        : <><div className="preview-grid">{captions.slice(0, 3).map(caption => <article className="caption-card" key={caption.id}><div className="card-top"><span className="tag">{caption.category}</span><span className="ai-label">AI GENERATED</span></div><h3>{caption.place}</h3><p className="moment">{caption.experience}</p><blockquote>{caption.caption}</blockquote></article>)}</div><div className="sign-in-invitation"><p>Have an opinion? Sign in to save your ratings and create your own captions.</p><Link className="button" href="/login">Sign in to join →</Link></div></>}
    </section>
    <footer>NYC, According to AI · Real moments. Artificial punchlines. Human taste.</footer>
  </main>;
}
