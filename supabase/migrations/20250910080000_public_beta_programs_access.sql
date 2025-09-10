-- Location: supabase/migrations/20250910080000_public_beta_programs_access.sql
-- Purpose: Allow public read access to beta_programs for booking workflow
-- Dependencies: Existing beta_programs table

-- Add public read access to beta_programs table for public booking workflow
CREATE POLICY "public_read_active_beta_programs"
ON public.beta_programs
FOR SELECT
TO anon
USING (
    is_active = true 
    AND access_type = 'public'
    AND (end_date IS NULL OR end_date >= CURRENT_DATE)
);
