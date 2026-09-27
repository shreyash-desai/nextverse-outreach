create table if not exists public.ai_chat_logs (
    id uuid default gen_random_uuid() primary key,
    user_email text not null,
    role text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set up RLS
alter table public.ai_chat_logs enable row level security;

-- Insert policy: Users can insert their own chat logs
create policy "Users can insert their own chat logs"
    on public.ai_chat_logs for insert
    with check (user_email = (select email from auth.users where id = auth.uid()));

-- Select policy: Users can view their own chat logs, Admins can view all
create policy "Users can view their own chat logs"
    on public.ai_chat_logs for select
    using (
        user_email = (select email from auth.users where id = auth.uid())
        or 
        exists (
            select 1 from public.users
            where public.users.id = auth.uid()
            and public.users.role = 'Admin'
        )
    );
