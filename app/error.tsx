"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="collection"><section className="notice" role="alert"><h1>Something went wrong.</h1>
    <p>We couldn’t load this page. Please try again in a moment.</p><button className="button" onClick={reset}>Try again</button></section></main>;
}
