-- Run once in the Supabase SQL Editor for this assignment project.
create table public.movies (
  id bigint generated always as identity primary key,
  title text not null,
  genre text not null,
  rating integer not null check (rating between 0 and 10)
);
alter table public.movies enable row level security;
revoke all on public.movies from anon, authenticated;
grant select on public.movies to anon;
create policy "Public can read movie list" on public.movies
  for select to anon using (true);
insert into public.movies (title, genre, rating) values
  ('Zootopia', 'Animation', 9),
  ('Interstellar', 'Science fiction', 10),
  ('Parasite', 'Drama', 9);
