import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Runs real PostgreSQL RLS with non-owner roles; never touches Supabase.
test('RLS, constraints, request limits, and migration repeatability', async () => {
  const db = new PGlite();
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create table public.movies(id integer);
    create table public.profiles(id uuid);
    insert into auth.users values ('${alice}'), ('${bob}');
  `);
  const migration = await readFile(new URL('../supabase/assignment4.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  await db.exec(migration);
  const as = async (user) => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user || '']);
    await db.exec(user ? 'set role authenticated' : 'set role anon');
  };
  const reject = async (sql, params = [], pattern = /permission denied|row-level security|duplicate key|check constraint|foreign key|generation_limit|Invalid generation owner/) => {
    await assert.rejects(db.query(sql, params), pattern);
  };
  const reserve = () => db.query('insert into public.generations(user_id,prompt,model) values ($1,$2,$3) returning id', [alice, 'A real test prompt for a NYC moment', 'test-model']);
  const publish = (id) => db.query('insert into public.captions(generation_id,place,category,experience,caption) values ($1,$2,$3,$4,$5) returning id', [id, 'Butler Library', 'Around campus', 'I spent two hours picking my study playlist.', 'Found a seat. Lost the plot.']);
  try {
    assert.equal((await db.query("select count(*)::int as count from pg_tables t join pg_class c on c.relname=t.tablename join pg_namespace n on n.oid=c.relnamespace where t.schemaname='public' and n.nspname='public' and not c.relrowsecurity")).rows[0].count, 0);
    await as(null);
    await reject('select * from public.generations');
    await reject('select * from public.caption_votes');
    await reject('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,1)', [alice, alice]);
    await reject('insert into public.generations(user_id,prompt,model) values ($1,$2,$3)', [alice, 'Anonymous test prompt', 'test']);
    await as(alice);
    await reject('insert into public.generations(user_id,prompt,model) values ($1,$2,$3)', [bob, 'Spoofed owner prompt', 'test']);
    const generation = (await reserve()).rows[0].id;
    await reject('insert into public.generations(user_id,prompt,model,created_at) values ($1,$2,$3,now()-interval \'1 day\')', [alice, 'Forged timestamp prompt', 'test']);
    await reject('delete from public.generations where id=$1', [generation]);
    await reject('update public.generations set prompt=$1 where id=$2', ['Edited prompt', generation]);
    await assert.rejects(reserve(), /generation_limit/);
    const caption = (await publish(generation)).rows[0].id;
    await assert.rejects(publish(generation), /duplicate key/);
    await db.query('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,1)', [alice, caption]);
    await reject('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,-1)', [alice, caption]);
    await reject('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,1)', [bob, caption]);
    await reject('update public.caption_votes set value=-1');
    await reject('delete from public.caption_votes');
    await as(bob);
    assert.equal((await db.query('select * from public.generations')).rows.length, 0);
    assert.equal((await db.query('select * from public.caption_votes')).rows.length, 0);
    await reject('insert into public.captions(generation_id,place,category,experience,caption) values ($1,$2,$3,$4,$5)', [generation, 'NYC', 'Landmarks', 'Someone else wrote the prompt.', 'Stolen generation.']);
    await reject('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,7)', [bob, caption]);
    await reject('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,1)', [bob, bob]);
    await db.query('insert into public.caption_votes(user_id,caption_id,value) values ($1,$2,-1)', [bob, caption]);
    assert.equal((await db.query('select * from public.caption_votes')).rows.length, 1);
    await as(null);
    assert.equal((await db.query('select * from public.captions')).rows.length, 1);
    await reject('update public.captions set caption=$1', ['Changed']);
    await reject('delete from public.captions');
    // Fixture adjustments as owner simulate a user reaching the rolling daily limit.
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [alice]);
    for (let i = 0; i < 9; i++) {
      await db.query("update public.generations set created_at=now()-interval '1 hour' where user_id=$1", [alice]);
      await reserve();
    }
    await db.query("update public.generations set created_at=now()-interval '1 hour' where user_id=$1", [alice]);
    await as(alice);
    await assert.rejects(reserve(), /generation_limit/);
    console.log('Verified: anonymous write denial; private prompts/votes; ownership; immutable records; unique votes; foreign keys; server-owned timestamps; 30-second and rolling 24-hour request limits.');
  } finally { await db.close(); }
});
