-- Public ratings without Google sign-in. Apply after Assignment 7 migrations.
begin;
alter table public.caption_votes alter column user_id drop not null;
alter table public.caption_votes add column if not exists guest_key text;
alter table public.caption_votes drop constraint if exists caption_vote_identity;
alter table public.caption_votes add constraint caption_vote_identity check (
 (user_id is not null and guest_key is null) or
 (user_id is null and guest_key is not null and guest_key ~ '^[a-f0-9]{64}$')
);
create unique index if not exists caption_votes_guest_unique on public.caption_votes(guest_key,caption_id) where guest_key is not null;
create index if not exists caption_votes_guest_time on public.caption_votes(guest_key,created_at) where guest_key is not null;
-- No anonymous table grants. Only narrow functions accept guest votes/return receipts.
create or replace function public.submit_guest_rating(p_key text,p_caption uuid,p_value smallint)
returns smallint language plpgsql security definer set search_path='' as $$
declare result smallint;
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' or p_value is null or p_value not in (-1,1) then
  raise exception 'Invalid rating' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key,3));
 select value into result from public.caption_votes where guest_key=p_key and caption_id=p_caption;
 if found then return result; end if;
 if (select count(*) from public.caption_votes where guest_key=p_key and created_at>now()-interval '1 hour')>=60 then
  raise exception 'rating_limit' using errcode='P0001';
 end if;
 insert into public.caption_votes(guest_key,caption_id,value) values(p_key,p_caption,p_value);
 return p_value;
end;
$$;
revoke all on function public.submit_guest_rating(text,uuid,smallint) from public;
grant execute on function public.submit_guest_rating(text,uuid,smallint) to anon,authenticated;
create or replace function public.guest_rating_receipts(p_key text)
returns table(caption_id uuid) language sql stable security definer set search_path='' as $$
 select v.caption_id from public.caption_votes v
 where p_key ~ '^[a-f0-9]{64}$' and v.guest_key=p_key order by v.created_at desc limit 1000;
$$;
revoke all on function public.guest_rating_receipts(text) from public;
grant execute on function public.guest_rating_receipts(text) to anon,authenticated;
commit;
