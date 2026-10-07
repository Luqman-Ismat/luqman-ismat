-- Project inquiries from luqmanismat.com/contact.
--
-- Security model: the table is closed to the public API roles (no grants, RLS
-- on, no policies). The website submits through submit_lead(), a SECURITY
-- DEFINER function that validates input, rate-limits per email and returns
-- only the new row's id. Nothing can read leads with the publishable key;
-- read them in the Supabase dashboard (table editor) or with the secret key.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  company text check (char_length(company) <= 150),
  service text not null check (char_length(service) <= 120),
  package text check (char_length(package) <= 150),
  timeline text check (char_length(timeline) <= 150),
  brief text not null check (char_length(brief) between 20 and 5000),
  source_path text check (char_length(source_path) <= 300),
  referrer text check (char_length(referrer) <= 500),
  utm jsonb not null default '{}'::jsonb,
  user_agent text check (char_length(user_agent) <= 400),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'spam')),
  notes text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_created_idx on public.leads (email, created_at desc);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

create or replace function public.submit_lead(
  p_name text,
  p_email text,
  p_company text,
  p_service text,
  p_package text,
  p_timeline text,
  p_brief text,
  p_source_path text,
  p_referrer text,
  p_utm jsonb,
  p_user_agent text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_id uuid;
begin
  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'name required' using errcode = '22023';
  end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'valid email required' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_brief, ''))) < 20 then
    raise exception 'brief too short' using errcode = '22023';
  end if;
  -- at most 5 inquiries per email per hour
  if (select count(*) from public.leads
      where email = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too many submissions' using errcode = 'P0001';
  end if;

  insert into public.leads (name, email, company, service, package, timeline, brief,
                            source_path, referrer, utm, user_agent)
  values (
    left(btrim(p_name), 100),
    left(v_email, 200),
    nullif(left(btrim(coalesce(p_company, '')), 150), ''),
    coalesce(nullif(left(btrim(coalesce(p_service, '')), 120), ''), 'General inquiry'),
    nullif(left(btrim(coalesce(p_package, '')), 150), ''),
    nullif(left(btrim(coalesce(p_timeline, '')), 150), ''),
    left(btrim(p_brief), 5000),
    nullif(left(coalesce(p_source_path, ''), 300), ''),
    nullif(left(coalesce(p_referrer, ''), 500), ''),
    case when jsonb_typeof(p_utm) = 'object' then p_utm else '{}'::jsonb end,
    nullif(left(coalesce(p_user_agent, ''), 400), '')
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.submit_lead(text, text, text, text, text, text, text, text, text, jsonb, text) from public;
grant execute on function public.submit_lead(text, text, text, text, text, text, text, text, text, jsonb, text) to anon;
