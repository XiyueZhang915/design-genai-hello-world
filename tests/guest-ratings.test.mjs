import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('guest ratings: isolated receipts, duplicate protection, validation, no anonymous table access',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;grant usage on schema public,auth to anon,authenticated;create table public.profiles(id uuid);`);
 await db.exec(await readFile(new URL('../supabase/assignment4.sql',import.meta.url),'utf8'));
 const migration=await readFile(new URL('../supabase/guest-ratings.sql',import.meta.url),'utf8');await db.exec(migration);await db.exec(migration);
 const owner='11111111-1111-4111-8111-111111111111';
 await db.exec(`insert into auth.users values('${owner}');alter table public.generations disable trigger enforce_generation_limit;insert into public.generations(user_id,prompt,model) values('${owner}','A genuine test prompt','test');insert into public.captions(generation_id,place,category,experience,caption) select id,'NYC','Landmarks','A moment for a test.','A generated test caption' from public.generations;`);
 const id=(await db.query('select id from public.captions')).rows[0].id;
 await db.exec('set role anon');
 const vote=(key,value)=>db.query('select public.submit_guest_rating($1,$2,$3::smallint) as value',[key,id,value]);
 const key='a'.repeat(64),other='b'.repeat(64);
 assert.equal((await vote(key,1)).rows[0].value,1);
 assert.equal((await vote(key,-1)).rows[0].value,1);
 assert.equal((await vote(other,-1)).rows[0].value,-1);
 assert.equal((await db.query('select * from public.guest_rating_receipts($1)',[key])).rows.length,1);
 assert.equal((await db.query('select * from public.guest_rating_receipts($1)',['c'.repeat(64)])).rows.length,0);
 await assert.rejects(vote('bad',1),/Invalid rating/);await assert.rejects(vote(key,0),/Invalid rating/);
 await assert.rejects(db.query('select * from public.caption_votes'),/permission denied/);
 await assert.rejects(db.query('select * from public.profiles'),/permission denied/);
 await assert.rejects(db.query('insert into public.caption_votes(guest_key,caption_id,value) values($1,$2,1)',[key,id]),/permission denied/);
 await db.exec('reset role');assert.equal((await db.query('select * from public.caption_votes')).rows.length,2);
 }finally{await db.close();}
});
