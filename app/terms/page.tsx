import Link from "next/link";

export default function Terms() {
  return <main className="collection"><p className="eyebrow">THE MOVIE SHELF</p>
    <h1>Terms<span>.</span></h1><p className="intro">Updated September 30, 2026.</p>
    <section className="panel"><h2>A class demonstration</h2><p>The Movie Shelf is a free educational project for browsing a small movie collection and trying member profiles. Its features and availability may change as the project develops.</p>
    <h2>Using your profile</h2><p>Use your own Google account. Upload only photos you have permission to share, and do not upload unlawful or harmful content. Keep your account secure and avoid sharing sensitive information in your profile.</p>
    <h2>Questions</h2><p>For help or a request to remove your account, contact <a href="mailto:bettyzh915@gmail.com">bettyzh915@gmail.com</a>. See our <Link href="/privacy">privacy explanation</Link> for how the app uses profile information.</p></section>
    <Link className="back-link" href="/">← Back to the movies</Link></main>;
}
