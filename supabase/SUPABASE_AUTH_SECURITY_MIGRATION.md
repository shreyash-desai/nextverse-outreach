# Supabase Security & Authentication Migration Specification

**Document Version:** 1.0  
**Target Application:** Nextverse Outreach CRM  
**Intended Implementer:** Shreyash Desai / Database Administrator  
**Status:** Ready for Execution on Supabase Cloud  

---

## 1. Executive Summary

The Nextverse Outreach CRM previously authenticated users via plaintext credential lookups against `public.users` and relied on public RLS policies (`USING (true)`).  
To enable safe team scaling and eliminate client-side role forgery, this migration transitions the application to **Supabase Auth** (`auth.users`) backed by a dedicated `public.profiles` table and role-based Row Level Security (RLS) policies.

---

## 2. Architecture & Role Model

1. **Authentication:** Handled exclusively by Supabase Auth (`supabase.auth.signInWithPassword`, sessions stored in secure Supabase client storage).
2. **Authorization & Roles:** Roles are stored in `public.profiles.role` (`'Admin'` or `'Employee'`).
3. **Founder Protections:** `kishan@gonextverse` and `shreyash@gonextverse` are permanently assigned the `'Admin'` role.
4. **Data Ownership:**
   - **Admins:** Can read and write all leads, activities, follow-ups, audit logs, and employee profiles.
   - **Employees:** Can read and update leads assigned to them (`leads.assigned_to = split_part(auth.jwt() ->> 'email', '@', 1)` or email match), schedule follow-ups, and record activities.
5. **Security Definer Function:** `public.is_admin()` evaluates administrative privileges directly inside PostgreSQL to ensure client-side tampering is rendered impossible.

---

## 3. Migration SQL (Execute in Supabase SQL Editor)

```sql
-- ============================================================================
-- NEXTVERSE OUTREACH CRM - SUPABASE AUTH & SECURITY MIGRATION
-- ============================================================================

-- 1. Create Profiles Table Linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Employee' CHECK (role IN ('Admin', 'Employee')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Security Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'Admin'
  );
$$;

-- 3. Automatic Profile Creation on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'Employee';
  v_username TEXT;
BEGIN
  v_username := split_part(NEW.email, '@', 1);

  -- Permanent founder administrator assignment
  IF lower(NEW.email) IN ('kishan@gonextverse', 'shreyash@gonextverse') THEN
    v_role := 'Admin';
  END IF;

  INSERT INTO public.profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, v_username, v_role)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = EXCLUDED.username;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
CREATE POLICY "Profiles read access"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Profiles admin update" ON public.profiles;
CREATE POLICY "Profiles admin update"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Secure Row Level Security on Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on leads" ON public.leads;
DROP POLICY IF EXISTS "Leads select policy" ON public.leads;
DROP POLICY IF EXISTS "Leads insert policy" ON public.leads;
DROP POLICY IF EXISTS "Leads update policy" ON public.leads;
DROP POLICY IF EXISTS "Leads delete policy" ON public.leads;

-- SELECT: Admins can see all leads; Employees see leads assigned to their username or email
CREATE POLICY "Leads select policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    assigned_to = split_part(auth.jwt() ->> 'email', '@', 1) OR
    assigned_to = (auth.jwt() ->> 'email')
  );

-- INSERT: Authenticated staff can insert leads
CREATE POLICY "Leads insert policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Admins can update all; Employees can update their assigned leads
CREATE POLICY "Leads update policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    assigned_to = split_part(auth.jwt() ->> 'email', '@', 1) OR
    assigned_to = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    public.is_admin() OR
    assigned_to = split_part(auth.jwt() ->> 'email', '@', 1) OR
    assigned_to = (auth.jwt() ->> 'email')
  );

-- DELETE: Only Admins can delete leads
CREATE POLICY "Leads delete policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. Secure Row Level Security on Activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on activities" ON public.activities;
DROP POLICY IF EXISTS "Activities select policy" ON public.activities;
DROP POLICY IF EXISTS "Activities insert policy" ON public.activities;

CREATE POLICY "Activities select policy"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    performed_by = split_part(auth.jwt() ->> 'email', '@', 1)
  );

CREATE POLICY "Activities insert policy"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Secure Row Level Security on Follow-ups
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Follow-ups select policy" ON public.follow_ups;
DROP POLICY IF EXISTS "Follow-ups update policy" ON public.follow_ups;
DROP POLICY IF EXISTS "Follow-ups insert policy" ON public.follow_ups;

CREATE POLICY "Follow-ups select policy"
  ON public.follow_ups
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        leads.assigned_to = split_part(auth.jwt() ->> 'email', '@', 1) OR
        leads.assigned_to = (auth.jwt() ->> 'email')
      )
    )
  );

CREATE POLICY "Follow-ups update policy"
  ON public.follow_ups
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = follow_ups.lead_id
      AND (
        leads.assigned_to = split_part(auth.jwt() ->> 'email', '@', 1) OR
        leads.assigned_to = (auth.jwt() ->> 'email')
      )
    )
  );

CREATE POLICY "Follow-ups insert policy"
  ON public.follow_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. Secure AI Chat Logs
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on ai_chat_logs" ON public.ai_chat_logs;
CREATE POLICY "AI logs select policy"
  ON public.ai_chat_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "AI logs insert policy"
  ON public.ai_chat_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

---

## 4. User Migration Steps for Shreyash

1. Open **Supabase Dashboard** -> **Authentication** -> **Users**.
2. Create/Invite the existing team accounts:
   - `Kishan@gonextverse` (Set password -> auto-assigned `'Admin'`)
   - `Shreyash@gonextverse` (Set password -> auto-assigned `'Admin'`)
   - `Tejas@gonextverse` (Set password -> assigned `'Employee'`)
   - `Tarun@gonextverse` (Set password -> assigned `'Employee'`)
3. Execute the SQL above in the **SQL Editor**.
4. Once verified, truncate or drop the legacy `public.users` table so plaintext passwords are completely eliminated from disk.
