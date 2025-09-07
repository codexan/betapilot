import { supabase } from '../lib/supabase';

// Get all email templates with optional filtering
export const getEmailTemplates = async (filters = {}) => {
  try {
    let query = supabase?.from('email_templates')?.select(`
        id,
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        usage_count,
        created_by,
        created_at,
        updated_at,
        user_profiles!email_templates_created_by_fkey(
          id,
          full_name,
          email
        )
      `)?.order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query?.eq('category', filters?.category);
    }
    if (filters?.is_active !== undefined) {
      query = query?.eq('is_active', filters?.is_active);
    }
    if (filters?.search) {
      query = query?.or(`name.ilike.%${filters?.search}%,subject.ilike.%${filters?.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get single email template by ID
export const getEmailTemplate = async (id) => {
  try {
    const { data, error } = await supabase?.from('email_templates')?.select(`
        id,
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        usage_count,
        created_by,
        created_at,
        updated_at,
        user_profiles!email_templates_created_by_fkey(
          id,
          full_name,
          email
        )
      `)?.eq('id', id)?.single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create new email template
export const createEmailTemplate = async (templateData) => {
  try {
    const { data: user } = await supabase?.auth?.getUser();
    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase?.from('email_templates')?.insert({
        name: templateData?.name,
        subject: templateData?.subject,
        content: templateData?.content,
        category: templateData?.category || 'general',
        variables: templateData?.variables || [],
        is_active: templateData?.is_active !== undefined ? templateData?.is_active : true,
        created_by: user?.user?.id
      })?.select(`
        id,
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        usage_count,
        created_by,
        created_at,
        updated_at
      `)?.single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update email template
export const updateEmailTemplate = async (id, templateData) => {
  try {
    const { data, error } = await supabase?.from('email_templates')?.update({
        name: templateData?.name,
        subject: templateData?.subject,
        content: templateData?.content,
        category: templateData?.category,
        variables: templateData?.variables,
        is_active: templateData?.is_active,
        updated_at: new Date()?.toISOString()
      })?.eq('id', id)?.select(`
        id,
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        usage_count,
        created_by,
        created_at,
        updated_at
      `)?.single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete email template
export const deleteEmailTemplate = async (id) => {
  try {
    const { error } = await supabase?.from('email_templates')?.delete()?.eq('id', id);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Duplicate email template
export const duplicateEmailTemplate = async (templateId) => {
  try {
    const { data: template, error: fetchError } = await getEmailTemplate(templateId);
    if (fetchError) throw fetchError;

    const { data: user } = await supabase?.auth?.getUser();
    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase?.from('email_templates')?.insert({
        name: `${template?.name} (Copy)`,
        subject: template?.subject,
        content: template?.content,
        category: template?.category,
        variables: template?.variables,
        is_active: false, // New duplicated templates start as inactive
        created_by: user?.user?.id
      })?.select(`
        id,
        name,
        subject,
        content,
        category,
        variables,
        is_active,
        usage_count,
        created_by,
        created_at,
        updated_at
      `)?.single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get template version history
export const getTemplateVersionHistory = async (templateId) => {
  try {
    const { data, error } = await supabase?.from('email_template_versions')?.select('*')?.eq('template_id', templateId)?.order('version_number', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get available template variables
export const getTemplateVariables = async () => {
  try {
    const { data, error } = await supabase?.from('template_variables')?.select('*')?.order('name');

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Send test email (placeholder - would integrate with email service)
export const sendTestEmail = async (templateData, testEmail) => {
  try {
    // This would typically integrate with an email service
    // For now, simulate the operation
    const { data, error } = await supabase?.rpc('send_test_email', {
      template_data: templateData,
      test_email: testEmail
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Increment template usage count
export const incrementTemplateUsage = async (templateId) => {
  try {
    const { error } = await supabase?.from('email_templates')?.update({
        usage_count: supabase.sql`usage_count + 1`
      })?.eq('id', templateId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Get template statistics
export const getTemplateStats = async () => {
  try {
    const { data, error } = await supabase?.from('email_templates')?.select('category, usage_count, is_active')?.eq('is_active', true);

    if (error) {
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      by_category: {},
      total_usage: 0
    };

    data?.forEach(template => {
      stats.by_category[template?.category] = (stats?.by_category?.[template?.category] || 0) + 1;
      stats.total_usage += template?.usage_count || 0;
    });

    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
function emailTemplateService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: emailTemplateService is not implemented yet.', args);
  return null;
}

export default emailTemplateService;