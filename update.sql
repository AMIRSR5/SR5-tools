-- SR5 Tools update: daily reset, subscription, settings, tool images, chat quota (safe to run more than once)
alter table public.profiles add column if not exists chat_used int not null default 0;
alter table public.profiles add column if not exists credits_day date;
alter table public.profiles add column if not exists pro_until timestamptz;

create table if not exists public.settings (key text primary key, value text not null default '');
insert into public.settings(key,value) values
 ('free_credits','3'),('free_chat','5'),('pro_credits','12'),('pro_chat','12'),('price_toman','30000'),('enamad_html','')
on conflict (key) do nothing;

create table if not exists public.tool_images (tool text primary key, url text not null, updated_at timestamptz default now());

alter table public.settings enable row level security;
alter table public.tool_images enable row level security;
drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "images read" on public.tool_images;
create policy "images read" on public.tool_images for select using (true);
drop policy if exists "images admin write" on public.tool_images;
create policy "images admin write" on public.tool_images for all using (public.is_admin()) with check (public.is_admin());

-- storage bucket for tool images
insert into storage.buckets (id, name, public) values ('tool-images','tool-images',true) on conflict (id) do nothing;
drop policy if exists "tool images read" on storage.objects;
create policy "tool images read" on storage.objects for select using (bucket_id = 'tool-images');
drop policy if exists "tool images admin insert" on storage.objects;
create policy "tool images admin insert" on storage.objects for insert with check (bucket_id = 'tool-images' and public.is_admin());
drop policy if exists "tool images admin update" on storage.objects;
create policy "tool images admin update" on storage.objects for update using (bucket_id = 'tool-images' and public.is_admin());
drop policy if exists "tool images admin delete" on storage.objects;
create policy "tool images admin delete" on storage.objects for delete using (bucket_id = 'tool-images' and public.is_admin());

create or replace function public.setting(k text, d int) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(nullif((select value from settings where key = k), '')::int, d) $$;

-- daily refresh + quota (Tehran day)
create or replace function public.quota(p_user uuid) returns json
language plpgsql security definer set search_path = public as $$
declare pr profiles; pro boolean; cl int; ch int;
        today date := (now() at time zone 'Asia/Tehran')::date;
begin
  select * into pr from profiles where id = p_user;
  if not found then return null; end if;
  pro := pr.pro_until is not null and pr.pro_until > now();
  cl := case when pro then setting('pro_credits',12) else setting('free_credits',3) end;
  ch := case when pro then setting('pro_chat',12) else setting('free_chat',5) end;
  if pr.credits_day is distinct from today then
    update profiles set credits = cl, chat_used = 0, credits_day = today where id = p_user returning * into pr;
  end if;
  return json_build_object('credits',pr.credits,'credits_limit',cl,'chat_left',greatest(ch - pr.chat_used,0),
    'chat_limit',ch,'is_pro',pro,'pro_until',pr.pro_until,'role',pr.role);
end $$;

create or replace function public.my_quota() returns json
language sql security definer set search_path = public as $$ select public.quota(auth.uid()) $$;
grant execute on function public.my_quota() to authenticated;
revoke execute on function public.quota(uuid) from public, anon, authenticated;

create or replace function public.spend_credit(p_user uuid, p_tool text, p_provider text) returns int
language plpgsql security definer set search_path = public as $$
declare left_c int;
begin
  perform public.quota(p_user);
  if (select role from profiles where id = p_user) = 'admin' then
    insert into usage_log(user_id,tool,provider) values (p_user,p_tool,p_provider);
    return (select credits from profiles where id = p_user);
  end if;
  update profiles set credits = credits - 1 where id = p_user and credits > 0 returning credits into left_c;
  if left_c is null then raise exception 'no_credits'; end if;
  insert into usage_log(user_id,tool,provider) values (p_user,p_tool,p_provider);
  return left_c;
end $$;

drop function if exists public.spend_chat(uuid,int);
create or replace function public.spend_chat(p_user uuid) returns int
language plpgsql security definer set search_path = public as $$
declare q json; ch int; n int;
begin
  q := public.quota(p_user);
  if q->>'role' = 'admin' then return -1; end if;
  ch := (q->>'chat_limit')::int;
  update profiles set chat_used = chat_used + 1 where id = p_user and chat_used < ch returning chat_used into n;
  if n is null then raise exception 'no_chat'; end if;
  return greatest(ch - n, 0);
end $$;
revoke execute on function public.spend_chat(uuid) from public, anon, authenticated;
revoke execute on function public.spend_credit(uuid,text,text) from public, anon, authenticated;
