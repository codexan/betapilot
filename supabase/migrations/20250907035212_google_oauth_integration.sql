-- Location: supabase/migrations/20250907035212_google_oauth_integration.sql
-- Schema Analysis: Existing user_profiles table with basic user info, need to extend for Google OAuth
-- Integration Type: Addition - Adding Google OAuth functionality to existing beta campaign system
-- Dependencies: user_profiles table (existing)

-- Add Google OAuth columns to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT, 
ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS google_email TEXT,
ADD COLUMN IF NOT EXISTS google_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMPTZ;

-- Create index for Google OAuth lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_connected ON public.user_profiles(google_connected);
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_email ON public.user_profiles(google_email);

-- Create table to track Gmail API usage and quota
CREATE TABLE public.gmail_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.beta_programs(id) ON DELETE CASCADE,
    emails_sent INTEGER DEFAULT 0,
    quota_used INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ,
    daily_limit_reached BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for gmail_api_usage
CREATE INDEX idx_gmail_api_usage_user_id ON public.gmail_api_usage(user_id);
CREATE INDEX idx_gmail_api_usage_campaign_id ON public.gmail_api_usage(campaign_id);

-- Create table to track sent invitations via Gmail
CREATE TABLE public.gmail_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_invitation_id UUID REFERENCES public.beta_invitations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    gmail_message_id TEXT,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    delivery_status TEXT DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for gmail_invitations
CREATE INDEX idx_gmail_invitations_beta_invitation_id ON public.gmail_invitations(beta_invitation_id);
CREATE INDEX idx_gmail_invitations_user_id ON public.gmail_invitations(user_id);
CREATE INDEX idx_gmail_invitations_gmail_message_id ON public.gmail_invitations(gmail_message_id);

-- Enable RLS for new tables
ALTER TABLE public.gmail_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for gmail_api_usage (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_gmail_api_usage"
ON public.gmail_api_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS policies for gmail_invitations (Pattern 2: Simple User Ownership) 
CREATE POLICY "users_manage_own_gmail_invitations"
ON public.gmail_invitations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to refresh Google access token
CREATE OR REPLACE FUNCTION public.refresh_google_token(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function would be called from the client-side to refresh tokens
    -- The actual refresh logic is handled in the React application
    -- This function can be used to mark tokens as needing refresh
    UPDATE public.user_profiles 
    SET google_token_expires_at = CURRENT_TIMESTAMP
    WHERE id = user_uuid AND id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Function to disconnect Google account
CREATE OR REPLACE FUNCTION public.disconnect_google_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles 
    SET 
        google_access_token = NULL,
        google_refresh_token = NULL,
        google_token_expires_at = NULL,
        google_email = NULL,
        google_connected = false,
        google_connected_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Function to update Gmail API usage
CREATE OR REPLACE FUNCTION public.update_gmail_usage(
    campaign_uuid UUID,
    emails_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.gmail_api_usage (user_id, campaign_id, emails_sent, quota_used, api_calls_count, last_sent_at)
    VALUES (auth.uid(), campaign_uuid, emails_count, emails_count, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, campaign_id) 
    DO UPDATE SET
        emails_sent = gmail_api_usage.emails_sent + emails_count,
        quota_used = gmail_api_usage.quota_used + emails_count, 
        api_calls_count = gmail_api_usage.api_calls_count + 1,
        last_sent_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Add updated_at trigger for gmail_api_usage
CREATE TRIGGER handle_gmail_api_usage_updated_at
    BEFORE UPDATE ON public.gmail_api_usage
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Mock data for testing
DO $$
DECLARE
    existing_user_id UUID;
    existing_campaign_id UUID;
BEGIN
    -- Get existing user and campaign IDs
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_campaign_id FROM public.beta_programs LIMIT 1;
    
    -- Update user profile with mock Google connection
    IF existing_user_id IS NOT NULL THEN
        UPDATE public.user_profiles
        SET 
            google_email = 'mock.user@gmail.com',
            google_connected = false, -- Initially disconnected
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_user_id;
        
        -- Create mock Gmail API usage record
        IF existing_campaign_id IS NOT NULL THEN
            INSERT INTO public.gmail_api_usage (user_id, campaign_id, emails_sent, quota_used, api_calls_count)
            VALUES (existing_user_id, existing_campaign_id, 0, 0, 0);
        END IF;
    END IF;
    
    -- If no existing users found, log notice
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No existing users found. Google OAuth columns added to user_profiles table.';
    END IF;
END $$;