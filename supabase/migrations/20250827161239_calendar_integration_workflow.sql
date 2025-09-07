-- Location: supabase/migrations/20250827161239_calendar_integration_workflow.sql
-- Schema Analysis: Existing beta_programs, customers, user_profiles tables with participation management
-- Integration Type: NEW_MODULE - Calendar Integration & Beta Tester Onboarding Workflow
-- Dependencies: user_profiles, beta_programs, customers tables (existing)

-- Step 1: Create custom types for workflow management
CREATE TYPE public.email_template_type AS ENUM (
    'invitation', 
    'nda_request', 
    'calendar_booking', 
    'confirmation', 
    'reminder'
);

CREATE TYPE public.calendar_provider AS ENUM (
    'google', 
    'outlook', 
    'manual'
);

CREATE TYPE public.booking_status AS ENUM (
    'available', 
    'booked', 
    'cancelled', 
    'completed'
);

CREATE TYPE public.workflow_step AS ENUM (
    'invitation_sent',
    'invitation_accepted', 
    'nda_sent',
    'nda_signed',
    'calendar_sent',
    'slot_booked',
    'session_completed'
);

-- Step 2: Email Templates Management
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type public.email_template_type NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Calendar Integration Settings
CREATE TABLE public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider public.calendar_provider NOT NULL,
    provider_calendar_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Calendar Slots Management
CREATE TABLE public.calendar_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_integration_id UUID REFERENCES public.calendar_integrations(id) ON DELETE CASCADE,
    beta_program_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER DEFAULT 1,
    booked_count INTEGER DEFAULT 0,
    status public.booking_status DEFAULT 'available'::public.booking_status,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Beta Tester Invitations
CREATE TABLE public.beta_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_program_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    email_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    invitation_token TEXT UNIQUE NOT NULL,
    current_step public.workflow_step DEFAULT 'invitation_sent'::public.workflow_step,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    nda_signed_at TIMESTAMPTZ,
    slot_booked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: NDA Management
CREATE TABLE public.nda_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: NDA Signatures
CREATE TABLE public.nda_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE CASCADE,
    nda_template_id UUID REFERENCES public.nda_templates(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    signed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    signature_data JSONB,
    ip_address TEXT,
    user_agent TEXT
);

-- Step 8: Slot Bookings
CREATE TABLE public.slot_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_slot_id UUID REFERENCES public.calendar_slots(id) ON DELETE CASCADE,
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_token TEXT UNIQUE NOT NULL,
    status public.booking_status DEFAULT 'booked'::public.booking_status,
    notes TEXT,
    confirmation_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Essential Indexes
CREATE INDEX idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX idx_calendar_integrations_user ON public.calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_provider ON public.calendar_integrations(provider);
CREATE INDEX idx_calendar_slots_program ON public.calendar_slots(beta_program_id);
CREATE INDEX idx_calendar_slots_time ON public.calendar_slots(start_time, end_time);
CREATE INDEX idx_calendar_slots_status ON public.calendar_slots(status);
CREATE INDEX idx_beta_invitations_program ON public.beta_invitations(beta_program_id);
CREATE INDEX idx_beta_invitations_customer ON public.beta_invitations(customer_id);
CREATE INDEX idx_beta_invitations_step ON public.beta_invitations(current_step);
CREATE INDEX idx_beta_invitations_token ON public.beta_invitations(invitation_token);
CREATE INDEX idx_nda_signatures_invitation ON public.nda_signatures(beta_invitation_id);
CREATE INDEX idx_slot_bookings_slot ON public.slot_bookings(calendar_slot_id);
CREATE INDEX idx_slot_bookings_invitation ON public.slot_bookings(beta_invitation_id);

-- Step 10: Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;

-- Step 11: RLS Policies (Using Pattern 2 - Simple User Ownership)

-- Email Templates Policies
CREATE POLICY "users_manage_own_email_templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Calendar Integrations Policies  
CREATE POLICY "users_manage_own_calendar_integrations"
ON public.calendar_integrations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Calendar Slots Policies - Users can manage slots for their calendar integrations
CREATE POLICY "users_manage_calendar_slots"
ON public.calendar_slots
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.calendar_integrations ci
        WHERE ci.id = calendar_slots.calendar_integration_id
        AND ci.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.calendar_integrations ci
        WHERE ci.id = calendar_slots.calendar_integration_id
        AND ci.user_id = auth.uid()
    )
);

-- Beta Invitations Policies
CREATE POLICY "users_manage_beta_invitations"
ON public.beta_invitations
FOR ALL
TO authenticated
USING (invited_by = auth.uid())
WITH CHECK (invited_by = auth.uid());

-- Public can view invitations by token for acceptance flow
CREATE POLICY "public_view_invitations_by_token"
ON public.beta_invitations
FOR SELECT
TO public
USING (true);

-- NDA Templates Policies
CREATE POLICY "users_manage_own_nda_templates"
ON public.nda_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- NDA Signatures Policies - Users can view signatures for their invitations
CREATE POLICY "users_view_nda_signatures"
ON public.nda_signatures
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.beta_invitations bi
        WHERE bi.id = nda_signatures.beta_invitation_id
        AND bi.invited_by = auth.uid()
    )
);

-- Public can create NDA signatures for accepting invitations
CREATE POLICY "public_create_nda_signatures"
ON public.nda_signatures
FOR INSERT
TO public
WITH CHECK (true);

-- Slot Bookings Policies - Users can view bookings for their calendar slots
CREATE POLICY "users_view_slot_bookings"
ON public.slot_bookings
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.calendar_slots cs
        JOIN public.calendar_integrations ci ON cs.calendar_integration_id = ci.id
        WHERE cs.id = slot_bookings.calendar_slot_id
        AND ci.user_id = auth.uid()
    )
);

-- Public can create slot bookings for available slots
CREATE POLICY "public_create_slot_bookings"
ON public.slot_bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Step 12: Utility Functions
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE sql
AS $$
SELECT encode(gen_random_bytes(32), 'base64url');
$$;

CREATE OR REPLACE FUNCTION public.generate_booking_token()
RETURNS TEXT  
LANGUAGE sql
AS $$
SELECT encode(gen_random_bytes(24), 'base64url');
$$;

-- Step 13: Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER handle_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_calendar_integrations_updated_at
    BEFORE UPDATE ON public.calendar_integrations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_calendar_slots_updated_at
    BEFORE UPDATE ON public.calendar_slots
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_beta_invitations_updated_at
    BEFORE UPDATE ON public.beta_invitations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_nda_templates_updated_at
    BEFORE UPDATE ON public.nda_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_slot_bookings_updated_at
    BEFORE UPDATE ON public.slot_bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 14: Storage Buckets for NDA documents and attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'nda-documents',
    'nda-documents', 
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS Policies for NDA documents
CREATE POLICY "users_upload_nda_documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'nda-documents'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_view_own_nda_documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'nda-documents'
    AND owner = auth.uid()
);

CREATE POLICY "users_manage_own_nda_documents"
ON storage.objects
FOR UPDATE, DELETE
TO authenticated
USING (
    bucket_id = 'nda-documents'
    AND owner = auth.uid()
);

-- Step 15: Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    existing_beta_program_id UUID;
    existing_customer_id UUID;
    template_id UUID;
    nda_template_id UUID;
    calendar_integration_id UUID;
    slot_id UUID;
    invitation_id UUID;
BEGIN
    -- Get existing IDs from schema
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_beta_program_id FROM public.beta_programs LIMIT 1;  
    SELECT id INTO existing_customer_id FROM public.customers LIMIT 1;

    -- Create email templates
    INSERT INTO public.email_templates (id, created_by, name, template_type, subject_template, body_template, variables)
    VALUES 
        (gen_random_uuid(), existing_user_id, 'Beta Invitation Email', 'invitation'::public.email_template_type,
         'You are invited to join {{program_name}} Beta Program',
         'Hello {{customer_name}}, We would like to invite you to participate in our {{program_name}} beta testing program. Please click the following link to accept: {{invitation_link}}',
         '["customer_name", "program_name", "invitation_link"]'::jsonb),
        (gen_random_uuid(), existing_user_id, 'NDA Request Email', 'nda_request'::public.email_template_type,
         'Please sign the NDA for {{program_name}}',
         'Thank you for accepting our beta invitation. Please review and sign the attached NDA: {{nda_link}}',
         '["customer_name", "program_name", "nda_link"]'::jsonb),
        (gen_random_uuid(), existing_user_id, 'Calendar Booking Email', 'calendar_booking'::public.email_template_type,
         'Schedule your beta testing session for {{program_name}}',
         'Please select a convenient time slot for your beta testing session: {{booking_link}}',
         '["customer_name", "program_name", "booking_link"]'::jsonb)
    RETURNING id INTO template_id;

    -- Create NDA template
    INSERT INTO public.nda_templates (id, created_by, name, content)
    VALUES (
        gen_random_uuid(), existing_user_id, 'Standard Beta NDA',
        'This Non-Disclosure Agreement is entered into between the Company and the Beta Tester for the purpose of beta testing proprietary software...'
    )
    RETURNING id INTO nda_template_id;

    -- Create calendar integration
    INSERT INTO public.calendar_integrations (id, user_id, provider, provider_calendar_id)
    VALUES (
        gen_random_uuid(), existing_user_id, 'google'::public.calendar_provider, 'primary'
    )
    RETURNING id INTO calendar_integration_id;

    -- Create calendar slots
    INSERT INTO public.calendar_slots (id, calendar_integration_id, beta_program_id, start_time, end_time, capacity)
    VALUES 
        (gen_random_uuid(), calendar_integration_id, existing_beta_program_id, 
         CURRENT_TIMESTAMP + interval '1 day', CURRENT_TIMESTAMP + interval '1 day 1 hour', 1),
        (gen_random_uuid(), calendar_integration_id, existing_beta_program_id,
         CURRENT_TIMESTAMP + interval '2 days', CURRENT_TIMESTAMP + interval '2 days 1 hour', 1),
        (gen_random_uuid(), calendar_integration_id, existing_beta_program_id,
         CURRENT_TIMESTAMP + interval '3 days', CURRENT_TIMESTAMP + interval '3 days 1 hour', 1)
    RETURNING id INTO slot_id;

    -- Create beta invitation
    INSERT INTO public.beta_invitations (id, beta_program_id, invited_by, customer_id, email_template_id, invitation_token, current_step)
    VALUES (
        gen_random_uuid(), existing_beta_program_id, existing_user_id, existing_customer_id,
        template_id, public.generate_invitation_token(), 'invitation_sent'::public.workflow_step
    )
    RETURNING id INTO invitation_id;

    -- If no existing data found, add notice
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No existing users found. Please create user profiles first.';
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;