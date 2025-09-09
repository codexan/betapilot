-- Location: supabase/migrations/20250827155351_email_templates_with_variables.sql
-- Schema Analysis: Existing customer management system with authentication
-- Integration Type: NEW MODULE - Email template management system
-- Dependencies: References existing user_profiles table

-- 1. Email template category enum
CREATE TYPE public.template_category AS ENUM ('invitation', 'reminder', 'feedback', 'completion', 'general');
CREATE TYPE public.template_status AS ENUM ('draft', 'active', 'archived');

-- 2. Email Templates Table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    category public.template_category DEFAULT 'general'::public.template_category,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Template Version History (for restore functionality)
CREATE TABLE public.email_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Template Variables Library
CREATE TABLE public.template_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    example_value TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Essential Indexes
CREATE INDEX idx_email_templates_created_by ON public.email_templates(created_by);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_templates_is_active ON public.email_templates(is_active);
CREATE INDEX idx_email_template_versions_template_id ON public.email_template_versions(template_id);
CREATE INDEX idx_template_variables_name ON public.template_variables(name);

-- 6. Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;

-- 7. Functions for role-based access (using existing is_admin_from_auth pattern)
-- Function already exists from previous migration, so we can use it directly

-- 8. RLS Policies using Pattern 2 (Simple User Ownership) and Pattern 6A (Admin Access)

-- Email templates - users manage their own, admins see all
CREATE POLICY "users_manage_own_email_templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.is_admin_from_auth())
WITH CHECK (created_by = auth.uid() OR public.is_admin_from_auth());

-- Template versions - follow template access
CREATE POLICY "users_manage_template_versions"
ON public.email_template_versions
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.email_templates et 
    WHERE et.id = template_id 
    AND (et.created_by = auth.uid() OR public.is_admin_from_auth())
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.email_templates et 
    WHERE et.id = template_id 
    AND (et.created_by = auth.uid() OR public.is_admin_from_auth())
));

-- Template variables - public read, admin manage
CREATE POLICY "public_can_read_template_variables"
ON public.template_variables
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_manage_template_variables"
ON public.template_variables
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 9. Triggers for automatic version creation and updated_at
CREATE OR REPLACE FUNCTION public.create_template_version()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    latest_version INTEGER;
BEGIN
    -- Get latest version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO latest_version
    FROM public.email_template_versions
    WHERE template_id = NEW.id;

    -- Create version record
    INSERT INTO public.email_template_versions (
        template_id, version_number, name, subject, content, variables
    )
    VALUES (
        NEW.id, latest_version, NEW.name, NEW.subject, NEW.content, NEW.variables
    );

    RETURN NEW;
END;
$$;

-- Create version on insert and significant updates
CREATE TRIGGER create_template_version_on_insert
  AFTER INSERT ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.create_template_version();

CREATE TRIGGER create_template_version_on_update
  AFTER UPDATE OF name, subject, content ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.create_template_version();

-- Update timestamp trigger
CREATE TRIGGER handle_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Mock Data for Email Templates
DO $$
DECLARE
    admin_user_id UUID;
    manager_user_id UUID;
    template1_id UUID := gen_random_uuid();
    template2_id UUID := gen_random_uuid();
    template3_id UUID := gen_random_uuid();
    template4_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO manager_user_id FROM public.user_profiles WHERE role = 'manager' LIMIT 1;

    -- Insert template variables library
    INSERT INTO public.template_variables (name, description, example_value, category) VALUES
        ('FirstName', 'Customer first name', 'John', 'user_info'),
        ('LastName', 'Customer last name', 'Doe', 'user_info'),
        ('BetaName', 'Beta testing campaign name', 'Mobile App Beta v2.1', 'campaign'),
        ('SlotLink', 'Beta testing slot booking link', 'https://betapilot.com/book-slot/abc123', 'campaign'),
        ('CompanyName', 'Customer company name', 'TechCorp Inc.', 'user_info'),
        ('ExpiryDate', 'Beta testing expiry date', '2024-09-15', 'campaign'),
        ('FeedbackLink', 'Feedback submission link', 'https://betapilot.com/feedback/xyz789', 'campaign'),
        ('SupportEmail', 'Support contact email', 'support@betapilot.com', 'system');

    -- Insert email templates with mock data
    INSERT INTO public.email_templates (id, name, subject, content, category, variables, created_by, usage_count) VALUES
        (template1_id, 'Beta Invitation - Mobile App', 'You are invited to test our new mobile app!', 
         E'Dear {{FirstName}},\n\nWe are excited to invite you to participate in the beta testing of our revolutionary mobile application, {{BetaName}}.\n\nAs a valued member of {{CompanyName}}, your feedback will be instrumental in shaping the final product.\n\n<strong>What you will be testing:</strong>\n• New user interface design\n• Enhanced performance features\n• Advanced security protocols\n\n<strong>Next Steps:</strong>\n1. Click the link below to book your testing slot\n2. Complete the setup process\n3. Start testing and provide feedback\n\n<a href="{{SlotLink}}">Book Your Testing Slot</a>\n\nPlease note that this beta access expires on {{ExpiryDate}}.\n\nThank you for helping us build something amazing!\n\nBest regards,\nThe Product Team', 
         'invitation'::public.template_category, 
         '["FirstName", "BetaName", "CompanyName", "SlotLink", "ExpiryDate"]'::jsonb, 
         admin_user_id, 45),
         
        (template2_id, 'Testing Reminder - Web Platform', 'Reminder: Your beta testing slot expires soon', 
         E'Hi {{FirstName}},\n\nThis is a friendly reminder that your beta testing access for {{BetaName}} will expire in 3 days.\n\nIf you have not started testing yet, please use the link below:\n{{SlotLink}}\n\nWe would love to hear your feedback before the testing period ends on {{ExpiryDate}}.\n\nQuestions? Reply to this email and we will help you out.\n\nThanks,\nBeta Testing Team', 
         'reminder'::public.template_category, 
         '["FirstName", "BetaName", "SlotLink", "ExpiryDate"]'::jsonb, 
         admin_user_id, 23),
         
        (template3_id, 'Feedback Request - API Testing', 'How was your {{BetaName}} testing experience?', 
         E'Hello {{FirstName}},\n\nThank you for participating in the {{BetaName}} beta testing program!\n\nYour testing session has concluded, and we would love to hear about your experience.\n\n<strong>Please share your thoughts on:</strong>\n• Overall user experience\n• Performance and reliability\n• Feature completeness\n• Any bugs or issues encountered\n\n<a href="{{FeedbackLink}}">Submit Your Feedback</a>\n\nYour insights are invaluable in helping us improve the product before launch.\n\nAs a token of appreciation, you will receive early access to the final release.\n\nThank you for your time and contribution!\n\nWarm regards,\nProduct Management Team', 
         'feedback'::public.template_category, 
         '["FirstName", "BetaName", "FeedbackLink"]'::jsonb, 
         manager_user_id, 67),
         
        (template4_id, 'Beta Completion Certificate', 'Congratulations! You have completed {{BetaName}} beta testing', 
         E'Congratulations {{FirstName}}!\n\nYou have successfully completed the beta testing program for {{BetaName}}.\n\n<strong>Your Contribution:</strong>\n• Testing duration: 2 weeks\n• Feedback submissions: 5\n• Bugs reported: 3\n• Feature suggestions: 2\n\nYour valuable feedback has directly contributed to improving the product quality.\n\n<strong>What is Next:</strong>\n• You will receive early access to the production release\n• Exclusive beta tester badge on your profile\n• Priority consideration for future beta programs\n\nThank you for being an essential part of our development process!\n\nBest wishes,\nThe {{CompanyName}} Team', 
         'completion'::public.template_category, 
         '["FirstName", "BetaName", "CompanyName"]'::jsonb, 
         manager_user_id, 12);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;