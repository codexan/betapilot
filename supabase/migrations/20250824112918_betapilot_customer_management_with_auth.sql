-- Location: supabase/migrations/20250824112918_betapilot_customer_management_with_auth.sql
-- Schema Analysis: Fresh project - no existing tables
-- Integration Type: Complete customer management system with authentication
-- Dependencies: None (initial migration)

-- 1. Custom Types for Beta Testing Platform
CREATE TYPE public.participation_status AS ENUM ('invited', 'active', 'completed', 'declined', 'paused');
CREATE TYPE public.customer_segment AS ENUM ('enterprise', 'startup', 'individual', 'academic', 'government');
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'member');

-- 2. Core User Profiles Table (Critical intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Beta Testing Customers Table (Main customer management)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    job_title TEXT,
    region TEXT,
    time_zone TEXT,
    language TEXT DEFAULT 'English',
    participation_status public.participation_status DEFAULT 'invited'::public.participation_status,
    device_info TEXT,
    os_info TEXT,
    browser_info TEXT,
    last_activity TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Customer Segments Junction Table (Many-to-many relationship)
CREATE TABLE public.customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    segment public.customer_segment NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Beta Programs Table
CREATE TABLE public.beta_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Customer Program Participation
CREATE TABLE public.customer_program_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    beta_program_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    status public.participation_status DEFAULT 'invited'::public.participation_status,
    joined_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(customer_id, beta_program_id)
);

-- 8. Essential Indexes for Performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_organization ON public.customers(organization_id);
CREATE INDEX idx_customers_status ON public.customers(participation_status);
CREATE INDEX idx_customers_created_by ON public.customers(created_by);
CREATE INDEX idx_customer_segments_customer ON public.customer_segments(customer_id);
CREATE INDEX idx_customer_segments_segment ON public.customer_segments(segment);
CREATE INDEX idx_beta_programs_active ON public.beta_programs(is_active);
CREATE INDEX idx_participation_customer ON public.customer_program_participation(customer_id);
CREATE INDEX idx_participation_program ON public.customer_program_participation(beta_program_id);

-- 9. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_program_participation ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies Using Best Practices

-- Pattern 1: Core user table - Simple ownership only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 6A: Role-based access using auth metadata for organizations
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "authenticated_users_view_organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_manage_organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Simple user ownership for customers
CREATE POLICY "users_manage_customers"
ON public.customers
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.is_admin_from_auth())
WITH CHECK (created_by = auth.uid() OR public.is_admin_from_auth());

-- Pattern 7: Complex relationship for customer segments
CREATE OR REPLACE FUNCTION public.can_access_customer_segments(segment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.customer_segments cs
    JOIN public.customers c ON cs.customer_id = c.id
    WHERE cs.id = segment_id 
    AND (c.created_by = auth.uid() OR public.is_admin_from_auth())
)
$$;

CREATE POLICY "users_manage_customer_segments"
ON public.customer_segments
FOR ALL
TO authenticated
USING (public.can_access_customer_segments(id))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id 
    AND (c.created_by = auth.uid() OR public.is_admin_from_auth())
));

-- Pattern 2: Simple user ownership for beta programs
CREATE POLICY "users_manage_beta_programs"
ON public.beta_programs
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.is_admin_from_auth())
WITH CHECK (created_by = auth.uid() OR public.is_admin_from_auth());

-- Pattern 7: Complex relationship for participation
CREATE OR REPLACE FUNCTION public.can_access_participation(participation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.customer_program_participation cpp
    JOIN public.customers c ON cpp.customer_id = c.id
    WHERE cpp.id = participation_id 
    AND (c.created_by = auth.uid() OR public.is_admin_from_auth())
)
$$;

CREATE POLICY "users_manage_participation"
ON public.customer_program_participation
FOR ALL
TO authenticated
USING (public.can_access_participation(id))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id 
    AND (c.created_by = auth.uid() OR public.is_admin_from_auth())
));

-- 11. Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 12. Trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 14. Update timestamp triggers
CREATE TRIGGER handle_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 15. Complete Mock Data for Beta Testing Platform
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    manager_uuid UUID := gen_random_uuid();
    google_org_id UUID := gen_random_uuid();
    microsoft_org_id UUID := gen_random_uuid();
    apple_org_id UUID := gen_random_uuid();
    amazon_org_id UUID := gen_random_uuid();
    meta_org_id UUID := gen_random_uuid();
    netflix_org_id UUID := gen_random_uuid();
    uber_org_id UUID := gen_random_uuid();
    airbnb_org_id UUID := gen_random_uuid();
    customer1_id UUID := gen_random_uuid();
    customer2_id UUID := gen_random_uuid();
    customer3_id UUID := gen_random_uuid();
    customer4_id UUID := gen_random_uuid();
    customer5_id UUID := gen_random_uuid();
    customer6_id UUID := gen_random_uuid();
    customer7_id UUID := gen_random_uuid();
    customer8_id UUID := gen_random_uuid();
    beta_program_id UUID := gen_random_uuid();
BEGIN
    -- Create complete auth.users records
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@pilotbeta.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "PilotBeta Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'manager@pilotbeta.com', crypt('manager123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "PilotBeta Manager", "role": "manager"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create organizations
    INSERT INTO public.organizations (id, name, industry, website) VALUES
        (google_org_id, 'Google Inc.', 'Technology', 'https://google.com'),
        (microsoft_org_id, 'Microsoft Corporation', 'Technology', 'https://microsoft.com'),
        (apple_org_id, 'Apple Inc.', 'Technology', 'https://apple.com'),
        (amazon_org_id, 'Amazon Web Services', 'Cloud Computing', 'https://aws.amazon.com'),
        (meta_org_id, 'Meta Platforms', 'Social Media', 'https://meta.com'),
        (netflix_org_id, 'Netflix Inc.', 'Entertainment', 'https://netflix.com'),
        (uber_org_id, 'Uber Technologies', 'Transportation', 'https://uber.com'),
        (airbnb_org_id, 'Airbnb Inc.', 'Travel', 'https://airbnb.com');

    -- Create beta program
    INSERT INTO public.beta_programs (id, name, description, start_date, end_date, created_by) VALUES
        (beta_program_id, 'PilotBeta v2.0 Beta Program', 'Testing new workflow automation features', '2024-08-01', '2024-12-31', admin_uuid);

    -- Create customers
    INSERT INTO public.customers (id, first_name, last_name, email, organization_id, job_title, region, time_zone, language, participation_status, device_info, os_info, browser_info, last_activity, created_by) VALUES
        (customer1_id, 'Sarah', 'Johnson', 'sarah.johnson@google.com', google_org_id, 'Senior Product Manager', 'North America', 'UTC-8', 'English', 'active'::public.participation_status, 'MacBook Pro M3', 'macOS Sonoma', 'Chrome 127', '2024-08-20T10:00:00Z', admin_uuid),
        (customer2_id, 'Michael', 'Chen', 'm.chen@microsoft.com', microsoft_org_id, 'UX Designer', 'North America', 'UTC-8', 'English', 'invited'::public.participation_status, 'Surface Studio', 'Windows 11', 'Edge 127', '2024-08-22T14:30:00Z', admin_uuid),
        (customer3_id, 'Emma', 'Rodriguez', 'emma.r@apple.com', apple_org_id, 'iOS Developer', 'North America', 'UTC-8', 'English', 'completed'::public.participation_status, 'iPhone 15 Pro', 'iOS 17.6', 'Safari 17', '2024-08-18T09:15:00Z', admin_uuid),
        (customer4_id, 'James', 'Wilson', 'james.wilson@amazon.com', amazon_org_id, 'Cloud Architect', 'North America', 'UTC-5', 'English', 'active'::public.participation_status, 'ThinkPad X1', 'Ubuntu 22.04', 'Firefox 129', '2024-08-23T16:45:00Z', manager_uuid),
        (customer5_id, 'Lisa', 'Thompson', 'lisa.t@meta.com', meta_org_id, 'Data Scientist', 'North America', 'UTC-8', 'English', 'declined'::public.participation_status, 'MacBook Air M2', 'macOS Ventura', 'Chrome 127', '2024-08-15T11:20:00Z', manager_uuid),
        (customer6_id, 'David', 'Kumar', 'd.kumar@netflix.com', netflix_org_id, 'Frontend Engineer', 'Asia Pacific', 'UTC+5:30', 'English', 'active'::public.participation_status, 'Dell XPS 13', 'Windows 11', 'Chrome 127', '2024-08-21T13:00:00Z', admin_uuid),
        (customer7_id, 'Sophie', 'Martin', 'sophie.martin@uber.com', uber_org_id, 'Product Designer', 'Europe', 'UTC+1', 'French', 'invited'::public.participation_status, 'MacBook Pro M3', 'macOS Sonoma', 'Safari 17', '2024-08-19T08:30:00Z', admin_uuid),
        (customer8_id, 'Alex', 'Garcia', 'alex.garcia@airbnb.com', airbnb_org_id, 'Growth Manager', 'Latin America', 'UTC-3', 'Spanish', 'active'::public.participation_status, 'MacBook Air M2', 'macOS Sonoma', 'Chrome 127', '2024-08-24T15:10:00Z', manager_uuid);

    -- Create customer segments
    INSERT INTO public.customer_segments (customer_id, segment) VALUES
        (customer1_id, 'enterprise'::public.customer_segment),
        (customer2_id, 'enterprise'::public.customer_segment),
        (customer3_id, 'enterprise'::public.customer_segment),
        (customer4_id, 'enterprise'::public.customer_segment),
        (customer5_id, 'enterprise'::public.customer_segment),
        (customer6_id, 'enterprise'::public.customer_segment),
        (customer7_id, 'startup'::public.customer_segment),
        (customer8_id, 'startup'::public.customer_segment);

    -- Create program participations
    INSERT INTO public.customer_program_participation (customer_id, beta_program_id, status, joined_at) VALUES
        (customer1_id, beta_program_id, 'active'::public.participation_status, '2024-08-01T10:00:00Z'),
        (customer2_id, beta_program_id, 'invited'::public.participation_status, null),
        (customer3_id, beta_program_id, 'completed'::public.participation_status, '2024-08-01T10:00:00Z'),
        (customer4_id, beta_program_id, 'active'::public.participation_status, '2024-08-02T14:00:00Z'),
        (customer6_id, beta_program_id, 'active'::public.participation_status, '2024-08-03T09:00:00Z'),
        (customer7_id, beta_program_id, 'invited'::public.participation_status, null),
        (customer8_id, beta_program_id, 'active'::public.participation_status, '2024-08-04T16:00:00Z');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;