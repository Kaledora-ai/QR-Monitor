-- =====================================================================
-- QR Monitor — estrutura completa do banco
-- Rode este arquivo inteiro no Supabase: SQL Editor → New query → Run.
-- Pode rodar de novo sem problema (é idempotente).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Perfis e créditos
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits integer not null default 0 check (credits >= 0),
  monthly_report boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger(user_id, created_at desc);

-- Novo usuário ganha 10 créditos
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, credits) values (new.id, new.email, 10)
  on conflict (id) do nothing;
  insert into public.credit_ledger (user_id, delta, reason) values (new.id, 10, 'Boas-vindas');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- QR Codes
-- ---------------------------------------------------------------------
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  name text not null,
  type text not null check (type in ('url','whatsapp','instagram','vcard','pdf','menu','wifi','pix','text')),
  is_dynamic boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  destination text,
  design jsonb not null default '{}'::jsonb,
  has_design boolean not null default false,
  is_permanent boolean not null default false,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active','paused')),
  share_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  expiry_warned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists qr_codes_user_idx on public.qr_codes(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Scans
-- ---------------------------------------------------------------------
create table if not exists public.scans (
  id bigint generated always as identity primary key,
  qr_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  visitor_hash text,
  is_unique boolean not null default true,
  country text,
  region text,
  city text,
  device text,
  os text,
  browser text
);
create index if not exists scans_qr_idx on public.scans(qr_id, scanned_at desc);
create index if not exists scans_visitor_idx on public.scans(qr_id, visitor_hash, scanned_at desc);

-- ---------------------------------------------------------------------
-- Cupons (você cria direto no Table Editor do Supabase)
-- ---------------------------------------------------------------------
create table if not exists public.coupons (
  code text primary key,
  credits integer not null check (credits > 0),
  max_uses integer not null default 1,
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  coupon_code text not null references public.coupons(code) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (coupon_code, user_id)
);

-- ---------------------------------------------------------------------
-- Segurança (RLS)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.qr_codes enable row level security;
alter table public.scans enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

drop policy if exists "perfil proprio" on public.profiles;
create policy "perfil proprio" on public.profiles for select using (auth.uid() = id);
drop policy if exists "perfil proprio update" on public.profiles;
create policy "perfil proprio update" on public.profiles for update using (auth.uid() = id);
revoke update on public.profiles from authenticated, anon;
grant update (monthly_report) on public.profiles to authenticated;

drop policy if exists "extrato proprio" on public.credit_ledger;
create policy "extrato proprio" on public.credit_ledger for select using (auth.uid() = user_id);

drop policy if exists "qr proprio select" on public.qr_codes;
create policy "qr proprio select" on public.qr_codes for select using (auth.uid() = user_id);
drop policy if exists "qr proprio update" on public.qr_codes;
create policy "qr proprio update" on public.qr_codes for update using (auth.uid() = user_id);
drop policy if exists "qr proprio delete" on public.qr_codes;
create policy "qr proprio delete" on public.qr_codes for delete using (auth.uid() = user_id);
-- Criação só pelas funções (que cobram os créditos)
revoke insert on public.qr_codes from authenticated, anon;
revoke update on public.qr_codes from authenticated, anon;
grant update (name, content, destination, design, status, updated_at) on public.qr_codes to authenticated;

drop policy if exists "scans dos meus qrs" on public.scans;
create policy "scans dos meus qrs" on public.scans for select
  using (exists (select 1 from public.qr_codes q where q.id = scans.qr_id and q.user_id = auth.uid()));
-- coupons e coupon_redemptions: sem políticas = ninguém lê pelo site (só as funções)

-- Impede burlar a cobrança: QR sem "design completo" não recebe logo/moldura/gradiente
create or replace function public.guard_qr_update()
returns trigger language plpgsql as $$
begin
  if not old.has_design then
    if coalesce(new.design->>'logo','') <> ''
       or coalesce(new.design->>'frame','none') <> 'none'
       or coalesce(new.design->>'gradient','false') = 'true'
       or coalesce(new.design->>'dots','square') <> 'square'
       or coalesce(new.design->>'corners','square') <> 'square' then
      raise exception 'Design completo exige créditos adicionais';
    end if;
  end if;
  if not old.is_dynamic and new.destination is distinct from old.destination then
    raise exception 'QR estático não pode ter o destino alterado';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists qr_guard on public.qr_codes;
create trigger qr_guard before update on public.qr_codes
  for each row execute function public.guard_qr_update();

-- ---------------------------------------------------------------------
-- Funções
-- ---------------------------------------------------------------------
create or replace function public.gen_code(len int default 7)
returns text language plpgsql as $$
declare
  chars text := 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..len loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end $$;

-- Tabela de preços (créditos). Mude aqui se quiser outros valores.
create or replace function public.qr_cost(p_dynamic boolean, p_permanent boolean, p_design boolean)
returns int language sql immutable as $$
  select case
    when not p_dynamic then 0
    else (case when p_permanent then 10 else 3 end) + (case when p_design then 2 else 0 end)
  end
$$;

create or replace function public.create_qr(
  p_name text, p_type text, p_content jsonb, p_destination text,
  p_design jsonb, p_has_design boolean, p_permanent boolean
) returns public.qr_codes
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_dynamic boolean := p_type not in ('wifi','pix','text');
  v_cost int;
  v_code text;
  v_row public.qr_codes;
begin
  if v_uid is null then raise exception 'Faça login'; end if;
  v_cost := public.qr_cost(v_dynamic, coalesce(p_permanent,false), v_dynamic and coalesce(p_has_design,false));

  if v_cost > 0 then
    update public.profiles set credits = credits - v_cost
      where id = v_uid and credits >= v_cost;
    if not found then raise exception 'Créditos insuficientes'; end if;
  end if;

  loop
    v_code := public.gen_code(7);
    exit when not exists (select 1 from public.qr_codes where code = v_code);
  end loop;

  insert into public.qr_codes (user_id, code, name, type, is_dynamic, content, destination, design,
                               has_design, is_permanent, expires_at)
  values (v_uid, v_code, left(coalesce(nullif(trim(p_name),''),'Meu QR Code'),80), p_type, v_dynamic,
          coalesce(p_content,'{}'::jsonb), p_destination, coalesce(p_design,'{}'::jsonb),
          v_dynamic and coalesce(p_has_design,false),
          (not v_dynamic) or coalesce(p_permanent,false),
          case when v_dynamic and not coalesce(p_permanent,false) then now() + interval '30 days' end)
  returning * into v_row;

  if v_cost > 0 then
    insert into public.credit_ledger (user_id, delta, reason, ref)
    values (v_uid, -v_cost, 'Criação de QR Code', v_row.id::text);
  end if;
  return v_row;
end $$;

create or replace function public.renew_qr(p_qr_id uuid)
returns public.qr_codes
language plpgsql security definer set search_path = public as $$
declare v_row public.qr_codes; v_uid uuid := auth.uid();
begin
  select * into v_row from public.qr_codes where id = p_qr_id and user_id = v_uid;
  if not found then raise exception 'QR Code não encontrado'; end if;
  if v_row.is_permanent then raise exception 'Este QR Code é permanente'; end if;
  update public.profiles set credits = credits - 3 where id = v_uid and credits >= 3;
  if not found then raise exception 'Créditos insuficientes'; end if;
  update public.qr_codes
     set expires_at = greatest(coalesce(expires_at, now()), now()) + interval '30 days',
         expiry_warned_at = null
   where id = p_qr_id returning * into v_row;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (v_uid, -3, 'Renovação 30 dias', p_qr_id::text);
  return v_row;
end $$;

create or replace function public.upgrade_permanent(p_qr_id uuid)
returns public.qr_codes
language plpgsql security definer set search_path = public as $$
declare v_row public.qr_codes; v_uid uuid := auth.uid();
begin
  select * into v_row from public.qr_codes where id = p_qr_id and user_id = v_uid and is_dynamic;
  if not found then raise exception 'QR Code não encontrado'; end if;
  if v_row.is_permanent then raise exception 'Já é permanente'; end if;
  update public.profiles set credits = credits - 10 where id = v_uid and credits >= 10;
  if not found then raise exception 'Créditos insuficientes'; end if;
  update public.qr_codes set is_permanent = true, expires_at = null where id = p_qr_id returning * into v_row;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (v_uid, -10, 'Tornar permanente', p_qr_id::text);
  return v_row;
end $$;

create or replace function public.upgrade_design(p_qr_id uuid)
returns public.qr_codes
language plpgsql security definer set search_path = public as $$
declare v_row public.qr_codes; v_uid uuid := auth.uid();
begin
  select * into v_row from public.qr_codes where id = p_qr_id and user_id = v_uid and is_dynamic;
  if not found then raise exception 'QR Code não encontrado'; end if;
  if v_row.has_design then return v_row; end if;
  update public.profiles set credits = credits - 2 where id = v_uid and credits >= 2;
  if not found then raise exception 'Créditos insuficientes'; end if;
  update public.qr_codes set has_design = true where id = p_qr_id returning * into v_row;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (v_uid, -2, 'Design completo', p_qr_id::text);
  return v_row;
end $$;

create or replace function public.redeem_coupon(p_code text)
returns int
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_c public.coupons;
begin
  if v_uid is null then raise exception 'Faça login'; end if;
  select * into v_c from public.coupons where upper(code) = upper(trim(p_code)) for update;
  if not found or not v_c.active then raise exception 'Cupom inválido'; end if;
  if v_c.expires_at is not null and v_c.expires_at < now() then raise exception 'Cupom expirado'; end if;
  if v_c.uses >= v_c.max_uses then raise exception 'Cupom esgotado'; end if;
  if exists (select 1 from public.coupon_redemptions where coupon_code = v_c.code and user_id = v_uid) then
    raise exception 'Você já usou este cupom';
  end if;
  insert into public.coupon_redemptions (coupon_code, user_id) values (v_c.code, v_uid);
  update public.coupons set uses = uses + 1 where code = v_c.code;
  update public.profiles set credits = credits + v_c.credits where id = v_uid;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (v_uid, v_c.credits, 'Cupom', v_c.code);
  return v_c.credits;
end $$;

-- Chamada pelo redirecionador (qualquer pessoa que escaneia)
create or replace function public.record_scan(
  p_code text, p_visitor text, p_country text, p_region text, p_city text,
  p_device text, p_os text, p_browser text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_q public.qr_codes; v_unique boolean;
begin
  select * into v_q from public.qr_codes where code = p_code;
  if not found then return jsonb_build_object('status','not_found'); end if;
  if v_q.status = 'paused' then return jsonb_build_object('status','paused'); end if;
  if v_q.expires_at is not null and v_q.expires_at < now() then
    return jsonb_build_object('status','expired');
  end if;
  v_unique := not exists (
    select 1 from public.scans where qr_id = v_q.id and visitor_hash = p_visitor
      and scanned_at > now() - interval '24 hours');
  insert into public.scans (qr_id, visitor_hash, is_unique, country, region, city, device, os, browser)
  values (v_q.id, p_visitor, v_unique, p_country, p_region, p_city, p_device, p_os, p_browser);
  return jsonb_build_object('status','ok','type',v_q.type,'destination',v_q.destination);
end $$;

-- Dados públicos de um QR de contato (página do cartão de visita)
create or replace function public.public_vcard(p_code text)
returns jsonb language sql security definer set search_path = public as $$
  select content from public.qr_codes
   where code = p_code and type = 'vcard' and status = 'active'
     and (expires_at is null or expires_at > now())
$$;

-- Relatório agregado (dono logado OU link público com token)
create or replace function public.qr_report(p_qr_id uuid, p_token text, p_days int default 30)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_q public.qr_codes; v_from timestamptz; v_result jsonb;
begin
  if p_token is not null then
    select * into v_q from public.qr_codes where share_token = p_token;
  else
    select * into v_q from public.qr_codes where id = p_qr_id and user_id = auth.uid();
  end if;
  if not found then return null; end if;
  v_from := now() - make_interval(days => greatest(1, least(coalesce(p_days,30), 3650)));

  with s as (
    select * from public.scans where qr_id = v_q.id and scanned_at >= v_from
  )
  select jsonb_build_object(
    'qr', jsonb_build_object('id', v_q.id, 'name', v_q.name, 'type', v_q.type, 'code', v_q.code,
                             'created_at', v_q.created_at, 'expires_at', v_q.expires_at,
                             'is_permanent', v_q.is_permanent, 'status', v_q.status),
    'total_all_time', (select count(*) from public.scans where qr_id = v_q.id),
    'total', (select count(*) from s),
    'unique', (select count(*) from s where is_unique),
    'by_day', coalesce((select jsonb_agg(jsonb_build_object('d', d, 'total', t, 'unique', u) order by d)
       from (select to_char(date_trunc('day', scanned_at at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD') d,
                    count(*) t, count(*) filter (where is_unique) u from s group by 1) x), '[]'::jsonb),
    'by_hour', coalesce((select jsonb_agg(jsonb_build_object('h', h, 'total', t) order by h)
       from (select extract(hour from scanned_at at time zone 'America/Sao_Paulo')::int h, count(*) t
               from s group by 1) x), '[]'::jsonb),
    'by_city', coalesce((select jsonb_agg(jsonb_build_object('k', k, 'total', t) order by t desc)
       from (select coalesce(city,'Desconhecida') || coalesce(' · ' || region,'') k, count(*) t
               from s group by 1 order by 2 desc limit 15) x), '[]'::jsonb),
    'by_region', coalesce((select jsonb_agg(jsonb_build_object('k', k, 'total', t) order by t desc)
       from (select coalesce(region,'Desconhecido') k, count(*) t from s group by 1 order by 2 desc limit 15) x), '[]'::jsonb),
    'by_device', coalesce((select jsonb_agg(jsonb_build_object('k', k, 'total', t) order by t desc)
       from (select coalesce(device,'Outro') k, count(*) t from s group by 1) x), '[]'::jsonb),
    'by_os', coalesce((select jsonb_agg(jsonb_build_object('k', k, 'total', t) order by t desc)
       from (select coalesce(os,'Outro') k, count(*) t from s group by 1) x), '[]'::jsonb),
    'by_browser', coalesce((select jsonb_agg(jsonb_build_object('k', k, 'total', t) order by t desc)
       from (select coalesce(browser,'Outro') k, count(*) t from s group by 1) x), '[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;

revoke all on function public.create_qr(text,text,jsonb,text,jsonb,boolean,boolean) from public, anon;
grant execute on function public.create_qr(text,text,jsonb,text,jsonb,boolean,boolean) to authenticated;
revoke all on function public.renew_qr(uuid) from public, anon;
grant execute on function public.renew_qr(uuid) to authenticated;
revoke all on function public.upgrade_permanent(uuid) from public, anon;
grant execute on function public.upgrade_permanent(uuid) to authenticated;
revoke all on function public.upgrade_design(uuid) from public, anon;
grant execute on function public.upgrade_design(uuid) to authenticated;
revoke all on function public.redeem_coupon(text) from public, anon;
grant execute on function public.redeem_coupon(text) to authenticated;
revoke all on function public.record_scan(text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_scan(text,text,text,text,text,text,text,text) to service_role;
grant execute on function public.public_vcard(text) to anon, authenticated;
grant execute on function public.qr_report(uuid,text,int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Armazenamento de arquivos (logos, PDFs, cardápios)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', true, 10485760)
on conflict (id) do update set public = true, file_size_limit = 10485760;

drop policy if exists "upload na propria pasta" on storage.objects;
create policy "upload na propria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "apagar da propria pasta" on storage.objects;
create policy "apagar da propria pasta" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "leitura publica uploads" on storage.objects;
create policy "leitura publica uploads" on storage.objects for select
  using (bucket_id = 'uploads');
