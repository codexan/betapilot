-- Location: supabase/migrations/20250827161240_beta_onboarding_workflow_extension.sql
-- Schema Analysis: Building upon existing beta program schema (customers, beta_programs, customer_program_participation)
-- Integration Type: Extension - adding NDA, calendar, and invitation workflow functionality
-- Dependencies: existing customers, user_profiles tables

-- 1. Create Types for workflow functionality
CREATE TYPE public.invitation_status AS ENUM ('draft', 'sent', 'responded', 'expired');
CREATE TYPE public.nda_status AS ENUM ('pending', 'signed', 'expired', 'declined');
CREATE TYPE public.calendar_slot_status AS ENUM ('available', 'booked', 'cancelled', 'completed');

-- 2. Beta Invitations Table
CREATE TABLE public.beta_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    beta_program_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.invitation_status DEFAULT 'draft'::public.invitation_status,
    email_subject TEXT,
    email_content TEXT,
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    invitation_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. NDA Management Table  
CREATE TABLE public.nda_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    nda_title TEXT NOT NULL,
    nda_content TEXT,
    nda_file_url TEXT,
    signature_url TEXT,
    status public.nda_status DEFAULT 'pending'::public.nda_status,
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Calendar Slots Management
CREATE TABLE public.calendar_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_program_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER DEFAULT 1,
    status public.calendar_slot_status DEFAULT 'available'::public.calendar_slot_status,
    description TEXT,
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Calendar Bookings Table
CREATE TABLE public.calendar_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_slot_id UUID REFERENCES public.calendar_slots(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE SET NULL,
    booking_token UUID DEFAULT gen_random_uuid(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for Performance
CREATE INDEX idx_beta_invitations_customer_id ON public.beta_invitations(customer_id);
CREATE INDEX idx_beta_invitations_beta_program_id ON public.beta_invitations(beta_program_id);
CREATE INDEX idx_beta_invitations_status ON public.beta_invitations(status);
CREATE INDEX idx_beta_invitations_token ON public.beta_invitations(invitation_token);

CREATE INDEX idx_nda_documents_customer_id ON public.nda_documents(customer_id);
CREATE INDEX idx_nda_documents_status ON public.nda_documents(status);
CREATE INDEX idx_nda_documents_beta_invitation_id ON public.nda_documents(beta_invitation_id);

CREATE INDEX idx_calendar_slots_date ON public.calendar_slots(slot_date);
CREATE INDEX idx_calendar_slots_beta_program_id ON public.calendar_slots(beta_program_id);
CREATE INDEX idx_calendar_slots_status ON public.calendar_slots(status);

CREATE INDEX idx_calendar_bookings_slot_id ON public.calendar_bookings(calendar_slot_id);
CREATE INDEX idx_calendar_bookings_customer_id ON public.calendar_bookings(customer_id);
CREATE INDEX idx_calendar_bookings_token ON public.calendar_bookings(booking_token);

-- 7. Enable RLS on all new tables
ALTER TABLE public.beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_bookings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_beta_invitations"
ON public.beta_invitations
FOR ALL
TO authenticated
USING (invited_by = auth.uid())
WITH CHECK (invited_by = auth.uid());

CREATE POLICY "users_manage_own_nda_documents"
ON public.nda_documents
FOR ALL
TO authenticated
USING (
    customer_id IN (
        SELECT id FROM public.customers WHERE created_by = auth.uid()
    )
);

CREATE POLICY "users_manage_own_calendar_slots"
ON public.calendar_slots
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "users_view_calendar_bookings"
ON public.calendar_bookings
FOR SELECT
TO authenticated
USING (
    calendar_slot_id IN (
        SELECT id FROM public.calendar_slots WHERE created_by = auth.uid()
    )
);

CREATE POLICY "authenticated_users_book_slots"
ON public.calendar_bookings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 9. Storage Buckets for NDA files and attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('nda-documents', 'nda-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('email-attachments', 'email-attachments', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'text/plain']);

-- 10. Storage RLS Policies - Pattern 1 (Private User Storage)
CREATE POLICY "users_upload_own_nda_documents"
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
USING (bucket_id = 'nda-documents' AND owner = auth.uid());

CREATE POLICY "users_manage_own_nda_documents_storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'nda-documents' AND owner = auth.uid())
WITH CHECK (bucket_id = 'nda-documents' AND owner = auth.uid());

CREATE POLICY "users_delete_own_nda_documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'nda-documents' AND owner = auth.uid());

CREATE POLICY "users_upload_email_attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'email-attachments'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_view_email_attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'email-attachments' AND owner = auth.uid());

-- 11. Triggers for updated_at timestamps
CREATE TRIGGER handle_beta_invitations_updated_at
    BEFORE UPDATE ON public.beta_invitations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_nda_documents_updated_at
    BEFORE UPDATE ON public.nda_documents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_calendar_slots_updated_at
    BEFORE UPDATE ON public.calendar_slots
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 12. Helper Functions for Workflow Management
CREATE OR REPLACE FUNCTION public.create_beta_invitation(
    p_customer_id UUID,
    p_beta_program_id UUID,
    p_email_subject TEXT,
    p_email_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_id UUID;
BEGIN
    INSERT INTO public.beta_invitations (
        customer_id,
        beta_program_id,
        invited_by,
        email_subject,
        email_content,
        expires_at
    ) VALUES (
        p_customer_id,
        p_beta_program_id,
        auth.uid(),
        p_email_subject,
        p_email_content,
        CURRENT_TIMESTAMP + INTERVAL '30 days'
    ) RETURNING id INTO invitation_id;
    
    RETURN invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sign_nda_document(
    p_nda_id UUID,
    p_signature_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.nda_documents
    SET 
        signature_url = p_signature_url,
        status = 'signed'::public.nda_status,
        signed_at = CURRENT_TIMESTAMP
    WHERE id = p_nda_id;
    
    RETURN FOUND;
END;
$$;

-- 13. Mock Data for Testing
DO $$
DECLARE
    existing_customer_id UUID;
    existing_beta_program_id UUID;
    existing_user_id UUID;
    invitation_id UUID;
    nda_id UUID;
    slot_id UUID;
BEGIN
    -- Get existing data IDs
    SELECT id INTO existing_customer_id FROM public.customers LIMIT 1;
    SELECT id INTO existing_beta_program_id FROM public.beta_programs LIMIT 1;
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_customer_id IS NOT NULL AND existing_beta_program_id IS NOT NULL AND existing_user_id IS NOT NULL THEN
        -- Create sample beta invitation
        INSERT INTO public.beta_invitations (
            customer_id,
            beta_program_id,
            invited_by,
            status,
            email_subject,
            email_content,
            sent_at,
            expires_at
        ) VALUES (
            existing_customer_id,
            existing_beta_program_id,
            existing_user_id,
            'sent'::public.invitation_status,
            'Welcome to PilotBeta v2.0 Beta Program',
            'Hi there, we are excited to invite you to join our beta program. Please review and sign the NDA to proceed.',
            CURRENT_TIMESTAMP - INTERVAL '2 hours',
            CURRENT_TIMESTAMP + INTERVAL '28 days'
        ) RETURNING id INTO invitation_id;
        
        -- Create sample NDA document
        INSERT INTO public.nda_documents (
            beta_invitation_id,
            customer_id,
            nda_title,
            nda_content,
            status,
            expires_at
        ) VALUES (
            invitation_id,
            existing_customer_id,
            'PilotBeta Beta Program Non-Disclosure Agreement',
            'This Non-Disclosure Agreement governs the disclosure of confidential information between PilotBeta and the beta tester.',
            'pending'::public.nda_status,
            CURRENT_TIMESTAMP + INTERVAL '30 days'
        ) RETURNING id INTO nda_id;
        
        -- Create sample calendar slots
        INSERT INTO public.calendar_slots (
            beta_program_id,
            created_by,
            slot_date,
            start_time,
            end_time,
            capacity,
            description,
            meeting_link
        ) VALUES 
            (existing_beta_program_id, existing_user_id, CURRENT_DATE + INTERVAL '7 days', '09:00:00', '10:00:00', 1, 'Beta Testing Session - Feature Demo', 'https://meet.google.com/abc-def-ghi'),
            (existing_beta_program_id, existing_user_id, CURRENT_DATE + INTERVAL '7 days', '14:00:00', '15:00:00', 1, 'Beta Testing Session - Feedback Collection', 'https://meet.google.com/xyz-uvw-rst'),
            (existing_beta_program_id, existing_user_id, CURRENT_DATE + INTERVAL '10 days', '10:00:00', '11:00:00', 1, 'Beta Testing Session - Final Review', 'https://meet.google.com/mno-pqr-stu');
    END IF;
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error during mock data creation: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error during mock data creation: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error during mock data creation: %', SQLERRM;
END $$;