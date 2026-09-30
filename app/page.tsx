import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccount, isComplete } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { connection } from "next/server";
import { getMovies, type Movie } from "@/lib/movies";

export default async function Home() {
  await connection();
  const { user, profile } = await getAccount();
  if (user && !isComplete(profile)) redirect("/profile");
  let movies: Movie[] = [];
  let failed = false;
  try { movies = await getMovies(); }
  catch { failed = true; }

  return (
    <main className="collection">
      <Navigation signedIn={Boolean(user)} />
      <header>
        <p className="eyebrow">THE MOVIE SHELF</p>
        <h1>My favorite movies<span>.</span></h1>
        <p className="intro">A little collection of stories worth watching again.</p>
      </header>
      <section aria-label="Favorite movies">
        {failed ? (
          <div className="notice" role="alert">
            <h2>We couldn’t load the movies.</h2>
            <p>Please try again in a moment.</p>
            <form action="/" method="get"><button type="submit" className="underline cursor-pointer">Try again →</button></form>
          </div>
        ) : movies.length === 0 ? (
          <div className="notice"><h2>No movies yet.</h2><p>The collection is waiting for its first movie.</p></div>
        ) : (
          <>
            <p className="count">{movies.length} movies in the collection</p>
            <ul className="movie-list">
              {movies.map((movie, index) => (
                <li className="movie" key={movie.id}>
                  <span className="number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="movie-info"><p className="genre">{movie.genre}</p><h2>{movie.title}</h2></div>
                  <p className="rating" aria-label={`My rating: ${movie.rating} out of 10`}><span>★</span> {movie.rating}<small>/10</small></p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <section className="panel gated-panel" aria-label="Members’ corner">
        <p className="genre">{user ? "YOUR MEMBERSHIP" : "A LITTLE EXTRA, JUST FOR MEMBERS"}</p>
        <h2>{user ? `Welcome back, ${profile?.first_name}.` : "Make it a movie night."}</h2>
        <p>{user ? "Your members’ corner is ready, with a double feature and a conversation starter." : "Sign in to discover our members’ corner and make this shelf your own."}</p>
        <Link className="button" href={user ? "/members" : "/login"}>{user ? "Visit members’ corner →" : "Sign in to explore →"}</Link>
      </section>
      <footer>Good stories stay with you.</footer>
    </main>
  );
}
