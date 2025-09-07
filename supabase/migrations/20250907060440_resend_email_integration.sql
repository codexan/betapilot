-- Location: supabase/migrations/20250907060440_resend_email_integration.sql
-- Schema Analysis: Existing beta_invitations and gmail_invitations tables
-- Integration Type: Addition - Adding Resend as additional email provider
-- Dependencies: beta_invitations, beta_programs, user_profiles (existing)

-- 1. Enum for email provider type
CREATE TYPE public.email_provider AS ENUM ('gmail', 'resend', 'outlook');

-- 2. Create Resend-specific tracking table
CREATE TABLE public.resend_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message_id TEXT, -- Resend message ID
    delivery_status TEXT DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Resend API usage tracking table (similar to gmail_api_usage)
CREATE TABLE public.resend_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    emails_sent INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    quota_used INTEGER DEFAULT 0,
    daily_limit_reached BOOLEAN DEFAULT false,
    last_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Resend configuration table for API keys and settings
CREATE TABLE public.resend_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    api_key_encrypted TEXT, -- Encrypted API key
    sender_name TEXT DEFAULT 'BetaPilot Team',
    sender_email TEXT DEFAULT 'notifications@betapilot.com',
    is_verified BOOLEAN DEFAULT false,
    domain_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add indexes for performance
CREATE INDEX idx_resend_invitations_beta_invitation_id ON public.resend_invitations(beta_invitation_id);
CREATE INDEX idx_resend_invitations_user_id ON public.resend_invitations(user_id);
CREATE INDEX idx_resend_invitations_message_id ON public.resend_invitations(message_id);
CREATE INDEX idx_resend_api_usage_user_id ON public.resend_api_usage(user_id);
CREATE INDEX idx_resend_api_usage_campaign_id ON public.resend_api_usage(campaign_id);
CREATE INDEX idx_resend_config_user_id ON public.resend_config(user_id);

-- 6. Add email provider tracking to beta_invitations (extend existing table)
ALTER TABLE public.beta_invitations 
ADD COLUMN IF NOT EXISTS email_provider public.email_provider DEFAULT 'resend'::public.email_provider;

-- 7. Create function for updating Resend usage
CREATE OR REPLACE FUNCTION public.update_resend_usage(
    p_user_id UUID,
    p_campaign_id UUID,
    p_emails_sent INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    INSERT INTO public.resend_api_usage (
        user_id, 
        campaign_id, 
        emails_sent, 
        api_calls_count,
        last_sent_at,
        updated_at
    )
    VALUES (
        p_user_id, 
        p_campaign_id, 
        p_emails_sent, 
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, campaign_id) 
    DO UPDATE SET
        emails_sent = public.resend_api_usage.emails_sent + p_emails_sent,
        api_calls_count = public.resend_api_usage.api_calls_count + 1,
        last_sent_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$func$;

-- 8. Create function for batch invitation creation (Resend-specific)
CREATE OR REPLACE FUNCTION public.create_resend_invitations(
    p_beta_program_id UUID,
    p_invitations JSONB
)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    invitation_ids UUID[] := '{}';
    invitation_record JSONB;
    new_invitation_id UUID;
BEGIN
    -- Process each invitation in the batch
    FOR invitation_record IN SELECT * FROM jsonb_array_elements(p_invitations)
    LOOP
        -- Create beta invitation record
        INSERT INTO public.beta_invitations (
            beta_program_id,
            customer_id,
            email_subject,
            email_content,
            email_provider,
            expires_at,
            invited_by
        )
        VALUES (
            p_beta_program_id,
            (invitation_record->>'customer_id')::UUID,
            invitation_record->>'email_subject',
            invitation_record->>'email_content',
            'resend'::public.email_provider,
            (invitation_record->>'expires_at')::TIMESTAMPTZ,
            auth.uid()
        )
        RETURNING id INTO new_invitation_id;
        
        invitation_ids := invitation_ids || new_invitation_id;
    END LOOP;
    
    RETURN invitation_ids;
END;
$func$;

-- 9. Enable RLS on new tables
ALTER TABLE public.resend_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resend_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resend_config ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_resend_invitations"
ON public.resend_invitations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_resend_api_usage"
ON public.resend_api_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_resend_config"
ON public.resend_config
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Create trigger for updating usage
CREATE TRIGGER handle_resend_api_usage_updated_at
    BEFORE UPDATE ON public.resend_api_usage
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_resend_config_updated_at
    BEFORE UPDATE ON public.resend_config
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 12. Mock data for testing (references existing users)
DO $$
DECLARE
    existing_user_id UUID;
    existing_program_id UUID;
    existing_customer_id UUID;
    existing_invitation_id UUID;
BEGIN
    -- Get existing user, program, and customer IDs
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_program_id FROM public.beta_programs LIMIT 1;
    SELECT id INTO existing_customer_id FROM public.customers LIMIT 1;
    
    -- Only add mock data if existing data is found
    IF existing_user_id IS NOT NULL AND existing_program_id IS NOT NULL THEN
        -- Create Resend config for existing user
        INSERT INTO public.resend_config (
            user_id,
            sender_name,
            sender_email,
            is_verified,
            domain_verified
        )
        VALUES (
            existing_user_id,
            'PM Name (BetaPilot)',
            'notifications@betapilot.com',
            true,
            true
        );
        
        -- Create Resend API usage record
        INSERT INTO public.resend_api_usage (
            user_id,
            campaign_id,
            emails_sent,
            api_calls_count
        )
        VALUES (
            existing_user_id,
            existing_program_id,
            0,
            0
        );
        
        -- Create sample Resend invitation if we have a customer
        IF existing_customer_id IS NOT NULL THEN
            -- Create beta invitation with Resend provider
            INSERT INTO public.beta_invitations (
                beta_program_id,
                customer_id,
                email_subject,
                email_content,
                email_provider,
                expires_at,
                invited_by
            )
            VALUES (
                existing_program_id,
                existing_customer_id,
                'Join our exclusive beta program - BetaPilot',
                'Hi there, we would love to have you participate in our beta program. Your feedback will be invaluable in helping us improve our product. Best regards, The BetaPilot Team',
                'resend'::public.email_provider,
                CURRENT_TIMESTAMP + INTERVAL '30 days',
                existing_user_id
            )
            RETURNING id INTO existing_invitation_id;
            
            -- Create corresponding Resend invitation record
            IF existing_invitation_id IS NOT NULL THEN
                INSERT INTO public.resend_invitations (
                    beta_invitation_id,
                    user_id,
                    recipient_email,
                    subject,
                    delivery_status
                )
                SELECT 
                    existing_invitation_id,
                    existing_user_id,
                    c.email,
                    'Join our exclusive beta program - BetaPilot',
                    'sent'
                FROM public.customers c 
                WHERE c.id = existing_customer_id;
            END IF;
        END IF;
        
        RAISE NOTICE 'Resend integration mock data created successfully';
    ELSE
        RAISE NOTICE 'No existing users or programs found. Resend tables created but no mock data added.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;