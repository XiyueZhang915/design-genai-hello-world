export type Movie = { id: number; title: string; genre: string; rating: number };

export async function getMovies(): Promise<Movie[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  const endpoint = new URL("/rest/v1/movies", url);
  endpoint.searchParams.set("select", "id,title,genre,rating");
  endpoint.searchParams.set("order", "id.asc");
  const response = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}).`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !rows.every(row =>
    typeof row.id === "number" && typeof row.title === "string" &&
    typeof row.genre === "string" && typeof row.rating === "number"
  )) throw new Error("Unexpected movie data.");
  return rows as Movie[];
}
