// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const migration=readFileSync('supabase/migrations/20261021030623_college_provenance_constraint_convergence.sql','utf8');

it('preserves legacy fit classifications and Dream preferences while permitting canonical provenance',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create table public.college_list(id int primary key,user_id uuid,college_name text,college_type text constraint college_list_college_type_check check(college_type in ('reach','match','safety','dream')),notes text);
   insert into public.college_list(id,college_type,notes) values (1,'reach',null),(2,'match',null),(3,'safety',null),(4,'dream','Legacy dream school id: retained'),(5,'dream','User note retained');`);
  await db.exec(migration);await db.exec(migration);
  const rows=await db.query<{id:number;college_type:string;is_dream:boolean;is_top:boolean;notes:string|null}>('select id,college_type,is_dream,is_top,notes from public.college_list order by id');
  expect(rows.rows.map(row=>[row.college_type,row.is_dream,row.is_top])).toEqual([['reach',false,false],['match',false,false],['safety',false,false],['legacy',true,false],['saved',true,false]]);
  expect(rows.rows[4].notes).toBe('User note retained');
  for(const type of ['catalog','manual','legacy','saved'])await db.query('insert into public.college_list(id,college_type) values($1,$2)',[10+['catalog','manual','legacy','saved'].indexOf(type),type]);
  await expect(db.query("insert into public.college_list(id,college_type) values(99,'invented')")).rejects.toThrow('check constraint');
 }finally{await db.close();}
},30000);

it('preserves independent priorities on a fresh schema without the historical constraint',async()=>{
 const db=new PGlite();try{
  await db.exec(`create table public.college_list(user_id uuid,college_type text,notes text,is_dream boolean not null default false,is_top boolean not null default false);insert into public.college_list(college_type,is_dream,is_top) values('catalog',true,true);`);
  await db.exec(migration);
  expect((await db.query('select college_type,is_dream,is_top from public.college_list')).rows).toEqual([{college_type:'catalog',is_dream:true,is_top:true}]);
 }finally{await db.close();}
},30000);

it('refuses to replace an unknown hosted constraint',async()=>{
 const db=new PGlite();try{
  await db.exec("create table public.college_list(college_type text constraint college_list_college_type_check check(college_type in ('unknown','custom')));");
  await expect(db.exec(migration)).rejects.toThrow('Unrecognized');
 }finally{await db.close();}
},30000);
