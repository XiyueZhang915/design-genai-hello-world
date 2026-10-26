import Link from "next/link";
import { getAccount } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { RatingDeck } from "@/components/rating-deck";
import { guestRatingKey } from "@/lib/guest-ratings";
import { connection } from "next/server";
import { categories, categoryLabels, type Caption, type Category } from "@/lib/humor";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const params = await searchParams;
  const selected = categories.includes(params.category as Category) ? params.category as Category : null;
  const page = /^\d{1,5}$/.test(params.page || "") ? Math.max(1, Number(params.page)) : 1;
  const browseUrl = (pageNumber: number, category: Category | null = selected) => `/?${new URLSearchParams({ ...(category ? { category } : {}), page: String(pageNumber) })}#community`;
  await connection();
  const { supabase, user, profile } = await getAccount();
  const { data, error } = await supabase.from("captions")
    .select("id,place,category,experience,caption,created_at").order("created_at", { ascending: false }).order("id").limit(60);
  const captions = (data || []) as Caption[];
  let communityQuery = supabase.from("captions").select("id,place,category,experience,caption,created_at", { count: "exact" });
  if (selected) communityQuery = communityQuery.eq("category", selected);
  const community = await communityQuery.order("created_at", { ascending: false }).order("id").range((page - 1) * 12, page * 12 - 1);
  const votes = user && captions.length ? await supabase.from("caption_votes").select("caption_id").eq("user_id", user.id).in("caption_id", captions.map(caption => caption.id)) : null;
  const guestKey = !user ? await guestRatingKey() : null;
  const guestVotes = guestKey ? await supabase.rpc("guest_rating_receipts", { p_key: guestKey }) : null;
  return <main className="collection nyc-home"><Navigation signedIn={Boolean(user)} />
    <header className="city-hero"><p className="eyebrow">NEW YORK MOMENTS. AI PUNCHLINES. YOUR VERDICT.</p>
      <h1>Big city.<br />Small inconveniences<span>.</span></h1>
      <p className="intro">The café essay that never got written. The subway ride that became a side quest. Turn everyday NYC into a caption worth laughing at.</p>
      <div className="hero-actions"><Link className="button" href={user ? "/create" : "/login"}>Turn your moment into a joke →</Link><a className="outline-button" href="#rate">Rate some captions ↓</a></div>
      <nav className="city-strip" aria-label="Browse caption categories">{categories.map((category, index) => <Link key={category} className="category-button" aria-current={selected === category ? "page" : undefined} href={browseUrl(1, category)}><span>0{index + 1}</span>{categoryLabels[category]}<span aria-hidden="true">→</span></Link>)}</nav>
    </header>
    <section id="rate" className="rating-section" aria-labelledby="rating-title"><p className="eyebrow">THE HUMAN PART OF AI HUMOR</p><h2 id="rating-title">{user ? `Your call, ${profile?.first_name || "neighbor"}.` : "Does the joke land?"}</h2>
      <p className="section-intro">Rate the AI caption, not the venue. No login needed. A few honest reactions go a long way.</p>
      {error?.code === "PGRST205" ? <div className="notice" role="status"><h3>The caption community is opening soon.</h3><p>We’re getting the collection ready. You can sign in and set up your profile in the meantime.</p><Link className="button" href={user ? "/profile" : "/login"}>{user ? "Visit your profile →" : "Sign in →"}</Link></div>
        : error || votes?.error || guestVotes?.error ? <div className="notice" role="alert"><h3>The captions couldn’t load.</h3><p>Please try again shortly.</p><form action="/" method="get"><button className="outline-button" type="submit">Try again →</button></form></div>
        : captions.length === 0 ? <div className="notice"><h3>The city has stories. We’re waiting for yours.</h3><p>No published captions yet. Be the first to turn a NYC moment into a joke.</p><Link className="button" href={user ? "/create" : "/login"}>{user ? "Create the first caption →" : "Sign in to create →"}</Link></div>
        : <RatingDeck captions={captions} votedIds={votes?.data?.map(vote => vote.caption_id) || guestVotes?.data?.map((vote: { caption_id: string }) => vote.caption_id) || []} />}

    </section>
    <section id="community" className="rating-section" aria-labelledby="community-title">
      <p className="eyebrow">REAL STORIES FROM THE COMMUNITY</p><h2 id="community-title">{selected ? categoryLabels[selected] : "Everyone’s NYC moments"}</h2>
      <p className="section-intro">Explore published AI captions from everyone, including ones you’ve already rated.</p>
      <nav className="community-filters" aria-label="Filter community captions"><Link className="outline-button" aria-current={!selected ? "page" : undefined} href={browseUrl(1, null)}>All moments</Link>{categories.map(category => <Link className="outline-button" key={category} aria-current={selected === category ? "page" : undefined} href={browseUrl(1, category)}>{categoryLabels[category]}</Link>)}</nav>
      {community.error ? <p className="message error" role="alert">We couldn’t load the community. Please try again.</p> : <>
        <div className="preview-grid">{(community.data as Caption[] || []).map(caption => <article className="caption-card" key={caption.id}><div className="card-top"><span className="tag">{categoryLabels[caption.category]}</span><span className="ai-label">AI GENERATED</span></div><h3>{caption.place}</h3><p className="moment">{caption.experience}</p><blockquote>{caption.caption}</blockquote></article>)}</div>
        {!community.data?.length && <p className="notice">No moments here yet. Share a story to get this category started.</p>}
        <nav className="community-pagination" aria-label="Community pages">{page > 1 && <Link className="outline-button" href={browseUrl(page - 1)}>← Previous</Link>}<span>Page {page} · {community.count || 0} captions</span>{page * 12 < (community.count || 0) && <Link className="outline-button" href={browseUrl(page + 1)}>Next →</Link>}</nav>
      </>}
    </section>
    <footer>NYC, According to AI · Real moments. Artificial punchlines. Human taste.</footer>
  </main>;
}
