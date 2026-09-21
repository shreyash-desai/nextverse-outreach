-- Supabase SQL Schema for Nextverse Outreach CRM

-- 1. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resort_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    designation TEXT,
    location TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    source TEXT,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    interest TEXT DEFAULT 'Unknown',
    reaction TEXT DEFAULT 'Unknown',
    score INTEGER DEFAULT 0,
    contact_method TEXT DEFAULT 'WhatsApp',
    first_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_type TEXT DEFAULT 'None',
    follow_up_notes TEXT,
    intelligence JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    lead_name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Follow-ups Table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    lead_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on follow_ups" ON public.follow_ups FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Realtime functionality for all tables
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.follow_ups;
