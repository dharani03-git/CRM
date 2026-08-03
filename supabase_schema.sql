-- Kottravai CRM Supabase Schema Migration Script
-- Copy this script and paste it into your Supabase SQL Editor (https://supabase.com/dashboard/project/sbcmxazpmgaeriwgtqsy/sql)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Employees Table
create table if not exists public.employees (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    phone text not null,
    role text not null default 'sales_executive',
    department text not null,
    manager_name text,
    status text not null default 'Active',
    target double precision not null default 0.0,
    achieved double precision not null default 0.0,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    deleted_at timestamp with time zone
);

-- 2. Create Leads Table
create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    company text not null,
    contact text not null,
    designation text,
    mobile text not null,
    email text not null,
    source text not null,
    category text not null,
    priority text not null default 'Medium',
    owner_id uuid references public.employees(id) on delete set null,
    status text not null default 'New',
    next_follow_up timestamp with time zone,
    last_contact timestamp with time zone,
    city text,
    product_interests jsonb not null default '[]'::jsonb,
    estimated_value double precision not null default 0.0,
    notes text,
    contacted boolean not null default false,
    assignment_history jsonb not null default '[]'::jsonb,
    activity jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    deleted_at timestamp with time zone
);

-- 3. Create Follow-ups Table
create table if not exists public.follow_ups (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references public.leads(id) on delete cascade,
    company text not null,
    contact text not null,
    time timestamp with time zone not null,
    method text not null,
    owner_id uuid references public.employees(id) on delete set null,
    status text not null default 'Pending',
    notes text,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    deleted_at timestamp with time zone
);

-- 4. Create Tasks Table
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    priority text not null default 'Medium',
    due_date timestamp with time zone not null,
    lead_id uuid references public.leads(id) on delete set null,
    assignee_id uuid references public.employees(id) on delete set null,
    status text not null default 'To Do',
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    deleted_at timestamp with time zone
);

-- 5. Create Quotations Table
create table if not exists public.quotations (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid references public.leads(id) on delete set null,
    company text not null,
    status text not null default 'Draft',
    owner_id uuid references public.employees(id) on delete set null,
    lines jsonb not null default '[]'::jsonb,
    discount_pct double precision not null default 0.0,
    tax_pct double precision not null default 0.0,
    notes text,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone('utc'::text, now()),
    deleted_at timestamp with time zone
);

-- Enable RLS and permissions (for testing, allow public read/write)
-- In production, you would configure secure RLS policies.
alter table public.employees enable row level security;
alter table public.leads enable row level security;
alter table public.follow_ups enable row level security;
alter table public.tasks enable row level security;
alter table public.quotations enable row level security;

create policy "Allow anonymous read" on public.employees for select using (true);
create policy "Allow anonymous insert" on public.employees for insert with check (true);
create policy "Allow anonymous update" on public.employees for update using (true);
create policy "Allow anonymous delete" on public.employees for delete using (true);

create policy "Allow anonymous read" on public.leads for select using (true);
create policy "Allow anonymous insert" on public.leads for insert with check (true);
create policy "Allow anonymous update" on public.leads for update using (true);
create policy "Allow anonymous delete" on public.leads for delete using (true);

create policy "Allow anonymous read" on public.follow_ups for select using (true);
create policy "Allow anonymous insert" on public.follow_ups for insert with check (true);
create policy "Allow anonymous update" on public.follow_ups for update using (true);
create policy "Allow anonymous delete" on public.follow_ups for delete using (true);

create policy "Allow anonymous read" on public.tasks for select using (true);
create policy "Allow anonymous insert" on public.tasks for insert with check (true);
create policy "Allow anonymous update" on public.tasks for update using (true);
create policy "Allow anonymous delete" on public.tasks for delete using (true);

create policy "Allow anonymous read" on public.quotations for select using (true);
create policy "Allow anonymous insert" on public.quotations for insert with check (true);
create policy "Allow anonymous update" on public.quotations for update using (true);
create policy "Allow anonymous delete" on public.quotations for delete using (true);
