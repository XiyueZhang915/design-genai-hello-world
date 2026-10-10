"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createCaption } from "@/app/create/actions";
import { categories, categoryLabels, type ActionState } from "@/lib/humor";

export function CreateForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createCaption, {});
  const [category, setCategory] = useState<string>(categories[0]);
  const [place, setPlace] = useState("");
  const [experience, setExperience] = useState("");
  return <>
    <form action={action} className="moment-form">
      <fieldset disabled={pending || !enabled}>
        <label htmlFor="category">What kind of place?<select id="category" name="category" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(category => <option key={category} value={category}>{categoryLabels[category]}</option>)}</select></label>
        <label htmlFor="place">Where were you?<input id="place" name="place" value={place} onChange={event => setPlace(event.target.value)} required minLength={2} maxLength={100} placeholder="e.g. a café near campus" /></label>
        <label htmlFor="experience">What’s the story?<textarea id="experience" name="experience" value={experience} onChange={event => setExperience(event.target.value)} required minLength={10} maxLength={500} rows={4} placeholder="I went in to finish my essay. Three hours later, I had a latte and a title." aria-describedby="moment-help" /></label>
        <p id="moment-help" className="field-help">Your place, story, and AI caption will be public. Keep personal details out. We’ll save the full prompt privately for your account.</p>
        <button className="button" type="submit">{pending ? "Finding the punchline…" : "Generate & publish caption →"}</button>
      </fieldset>
      <p className="field-help">Up to 10 attempts per 24 hours. Leave 30 seconds between attempts.</p>
      <div aria-live="polite">{state.error && <p className="message error" role="alert">{state.error}</p>}</div>
    </form>
    {state.caption && <section className="caption-card generated" aria-label="Published caption">
      <p className="tag">SAVED & PUBLISHED · AI GENERATED</p><h2>{state.caption.place}</h2>
      <p className="moment">{state.caption.experience}</p><blockquote>{state.caption.caption}</blockquote>
      <Link className="button" href="/">Go rate the community’s captions →</Link>
    </section>}
  </>;
}
