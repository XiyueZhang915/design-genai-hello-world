import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { publishedCaption } from "@/lib/generation-history";

export default async function Members() {
  const { supabase, user, profile } = await requireAccount();
  if (!isComplete(profile)) redirect("/profile");
  const { data: generations, error } = await supabase.from("generations").select("id,prompt,model,created_at,captions(id,place,caption)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  return <main className="collection"><Navigation signedIn /><p className="eyebrow">YOUR NYC NOTEBOOK</p><h1>Your moments, remixed<span>.</span></h1>
    <p className="intro">Welcome, {profile?.first_name}. Your latest 30 generation attempts live here, including the exact prompt sent to AI.</p>
    <Link href="/create" className="button">Create a caption →</Link>
    <section className="notebook-list" aria-label="Your generation history">
      {error ? <p className="notice" role="alert">Your notebook couldn’t load. Please try again later.</p> : !generations?.length ? <p className="notice">No moments yet. Start with a place and something that happened.</p> : generations.map(generation => {
        const caption = publishedCaption(generation.captions);
        return <article key={generation.id} className="caption-card"><p className="tag">{generation.model} · {new Date(generation.created_at).toLocaleDateString("en-US", { timeZone: "America/New_York" })}</p>
        {caption ? <div><h2>{caption.place}</h2><blockquote>{caption.caption}</blockquote></div> : <p>No caption published from this attempt. The generation or saving step didn’t complete.</p>}
        <details><summary>View saved prompt · only visible to you</summary><pre className="saved-prompt">{generation.prompt}</pre></details>
      </article>; })}
    </section>
  </main>;
}
