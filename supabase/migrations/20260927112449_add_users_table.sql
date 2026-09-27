CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
alter publication supabase_realtime add table public.users;

-- Insert default users
INSERT INTO public.users (username, password, role) VALUES 
('Kishan@gonextverse', 'Kishan@169', 'Admin'),
('Shreyash@gonextverse', 'Shreyash@123', 'Admin'),
('Tejas@gonextverse', 'Tejas@123', 'Employee'),
('Tarun@gonextverse', 'Tarun@143', 'Employee')
ON CONFLICT (username) DO NOTHING;
