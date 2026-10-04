"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { voteCaption } from "@/app/create/actions";
import { type Caption, type ActionState } from "@/lib/humor";

function RatingCard({ caption, onSaved, onNext, last }: { caption: Caption; onSaved: (id: string, value: number) => void; onNext: () => void; last: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(voteCaption.bind(null, caption.id), {});
  useEffect(() => { if (state.saved && state.value) onSaved(caption.id, state.value); }, [state.saved, state.value, caption.id, onSaved]);
  return <article className="caption-card">
    <div className="card-top"><span className="tag">{caption.category}</span><span className="ai-label">AI GENERATED</span></div>
    <h3>{caption.place}</h3><p className="moment">{caption.experience}</p><blockquote>{caption.caption}</blockquote>
    <p className="rating-question">Did the caption land?</p>
    <form action={action} className="vote-buttons">
      <button name="value" value="1" disabled={pending || state.saved} className={`vote-button ${state.saved && state.value === 1 ? "selected" : ""}`}>Made me laugh +</button>
      <button name="value" value="-1" disabled={pending || state.saved} className={`vote-button ${state.saved && state.value === -1 ? "selected" : ""}`}>Not quite −</button>
    </form>
    <div className="vote-feedback" aria-live="polite">{pending ? "Saving your rating…" : state.saved ? "Rating saved. Thanks for giving AI some human feedback." : "Rate the AI caption, not the place. One vote per caption."}</div>
    {state.error && <p className="message error" role="alert">{state.error}</p>}
    {state.saved && <button className="button next-caption" onClick={onNext}>{last ? "See your recap →" : "Next caption →"}</button>}
  </article>;
}

export function RatingDeck({ captions, votedIds }: { captions: Caption[]; votedIds: string[] }) {
  const [available] = useState(() => captions.filter(caption => !votedIds.includes(caption.id)));
  const [batch, setBatch] = useState(() => available.slice(0, 5));
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const onSaved = useCallback((id: string, value: number) => {
    setRatings(previous => previous[id] === value ? previous : { ...previous, [id]: value });
  }, []);
  if (batch.length === 0) return <div className="notice"><h3>You’re all caught up.</h3><p>You’ve rated the captions in the latest collection. Bring a NYC moment of your own, or come back for new ones.</p><Link className="button" href="/create">Create a caption →</Link></div>;
  const complete = index >= batch.length;
  const savedCount = batch.filter(caption => ratings[caption.id] !== undefined).length;
  const liked = batch.filter(caption => ratings[caption.id] === 1);
  const remaining = available.filter(caption => ratings[caption.id] === undefined);
  return <div className="rating-deck">
    <div className="round-header"><span>{complete ? "ROUND COMPLETE" : `CAPTION ${index + 1} OF ${batch.length}`}</span><span>{savedCount}/{batch.length} ratings saved</span></div>
    <progress value={savedCount} max={batch.length} aria-label="Ratings saved this round" />
    {complete ? <section className="caption-card recap"><p className="tag">YOUR TASTE, THIS ROUND</p><h3>{liked.length ? `${liked.length} ${liked.length === 1 ? "caption" : "captions"} made you laugh.` : "A tough crowd. We respect it."}</h3>
      <p className="moment">All {batch.length} ratings are saved. Your feedback helps us learn which AI jokes land.</p>
      {liked.map(caption => <div className="recap-favorite" key={caption.id}><p className="tag">{caption.place}</p><p>{caption.caption}</p></div>)}
      <div className="recap-actions">{remaining.length > 0 && <button className="button" onClick={() => { setBatch(remaining.slice(0, 5)); setIndex(0); }}>Another round →</button>}<Link href="/create" className="outline-button">Bring your own moment →</Link></div>
    </section> : <RatingCard key={batch[index].id} caption={batch[index]} onSaved={onSaved} onNext={() => setIndex(previous => previous + 1)} last={index === batch.length - 1} />}
  </div>;
}
