-- Phase 8 addendum: split address into structured fields
alter table users
  add column if not exists street  text,
  add column if not exists city    text,
  add column if not exists state   text,
  add column if not exists zip     text;
