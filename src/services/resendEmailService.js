import { supabase } from '../lib/supabase';

class ResendEmailService {
  constructor() {
    this.apiEndpoint = `${import.meta.env?.VITE_SUPABASE_URL}/functions/v1/resend-email`;
  }

  /**
   * Send batch invitations via Resend
   */
  async sendBatchInvitations(invitations, campaignData, userConfig = {}) {
    try {
      const { data: { session } } = await supabase?.auth?.getSession();
      
      if (!session?.user?.id) {
        throw new Error('Authentication required - user session not found');
      }

      // Validate user ID format before proceeding
      if (!this.isValidUUID(session?.user?.id)) {
        throw new Error('Invalid user session - please sign in again');
      }

      // Validate required parameters
      if (!invitations || invitations?.length === 0) {
        throw new Error('No invitations provided');
      }

      if (!campaignData?.emailSubject || !campaignData?.emailContent) {
        throw new Error('Campaign data is incomplete - subject and content required');
      }

      // Get user config before making the API call with proper error handling
      let userConfiguration = userConfig;
      try {
        const configResult = await this.getUserConfig(session?.user?.id);
        if (configResult?.success && configResult?.data) {
          userConfiguration = {
            senderEmail: configResult?.data?.sender_email || userConfig?.senderEmail || 'PM Name (BetaPilot) <notifications@betapilot.com>',
            senderName: configResult?.data?.sender_name || userConfig?.senderName || 'PM Name (BetaPilot)'
          };
        }
      } catch (configError) {
        console.warn('Failed to get user config, using defaults:', configError?.message);
        // Continue with provided userConfig or defaults
        userConfiguration = {
          senderEmail: userConfig?.senderEmail || 'PM Name (BetaPilot) <notifications@betapilot.com>',
          senderName: userConfig?.senderName || 'PM Name (BetaPilot)'
        };
      }

      // Prepare request payload with validated data
      const requestPayload = {
        invitations: invitations?.filter(invitation => invitation?.email)?.map(invitation => ({
          email: invitation?.email,
          firstName: invitation?.firstName || invitation?.first_name || 'there',
          lastName: invitation?.lastName || invitation?.last_name || '',
          betaInvitationId: invitation?.betaInvitationId || null
        })),
        campaignData: {
          campaignName: campaignData?.campaignName || 'Beta Program',
          emailSubject: campaignData?.emailSubject,
          emailContent: campaignData?.emailContent,
          senderName: campaignData?.senderName || userConfiguration?.senderName || 'PM Name (BetaPilot)'
        },
        userConfig: userConfiguration
      };

      // Validate that we have invitations to send
      if (requestPayload?.invitations?.length === 0) {
        throw new Error('No valid email addresses found in invitations');
      }

      // Call Supabase Edge Function
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response?.ok) {
        const errorText = await response?.text();
        let errorMessage = 'Failed to send emails via Resend';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData?.error || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response?.json();

      // Store results in database if successful
      if (result?.success && result?.results?.length > 0) {
        try {
          await this.storeEmailResults(result?.results, campaignData, session?.user?.id);
        } catch (storeError) {
          console.error('Failed to store email results, but emails were sent:', storeError);
          // Don't fail the entire operation if storing results fails
        }
      }

      return {
        success: true,
        data: result?.results || [],
        stats: result?.stats || { total: 0, sent: 0, failed: 0 },
        message: result?.message || 'Emails processed successfully'
      };

    } catch (error) {
      console.error('ResendEmailService error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to send emails via Resend'
      };
    }
  }

  /**
   * Validate UUID format
   */
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex?.test(uuid);
  }

  /**
   * Store email sending results in database
   */
  async storeEmailResults(results, campaignData, userId) {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        throw new Error('Valid user ID is required to store email results');
      }

      if (!results || results?.length === 0) {
        return; // Nothing to store
      }

      const resendInvitations = results?.map(result => ({
        user_id: userId,
        recipient_email: result?.email,
        subject: campaignData?.emailSubject || 'Beta Program Invitation',
        message_id: result?.messageId || null,
        delivery_status: result?.status || (result?.success ? 'sent' : 'failed'),
        error_message: result?.error || null,
        beta_invitation_id: result?.betaInvitationId || null,
        sent_at: new Date()?.toISOString()
      }));

      const { error } = await supabase?.from('resend_invitations')?.insert(resendInvitations);

      if (error) {
        console.error('Failed to store email results:', error);
        throw error;
      }

      // Update usage statistics
      const successCount = results?.filter(r => r?.success)?.length || 0;
      if (successCount > 0 && campaignData?.campaignId) {
        await this.updateUsageStats(userId, campaignData?.campaignId, successCount);
      }

    } catch (error) {
      console.error('Error storing email results:', error);
      throw error;
    }
  }

  /**
   * Update Resend API usage statistics
   */
  async updateUsageStats(userId, campaignId, emailsSent) {
    try {
      if (!userId || !this.isValidUUID(userId) || !emailsSent || emailsSent <= 0) {
        return;
      }

      const { error } = await supabase?.rpc('update_resend_usage', {
        p_user_id: userId,
        p_campaign_id: campaignId,
        p_emails_sent: emailsSent
      });

      if (error) {
        console.error('Failed to update usage stats:', error);
      }
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  /**
   * Get user's Resend configuration with enhanced validation
   */
  async getUserConfig(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!this.isValidUUID(userId)) {
        throw new Error('Invalid user ID format');
      }

      const { data, error } = await supabase
        ?.from('resend_config')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code !== 'PGRST116') { // Not found is OK
        throw error;
      }

      return {
        success: true,
        data: data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get user config'
      };
    }
  }

  /**
   * Update user's Resend configuration
   */
  async updateUserConfig(userId, config) {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        throw new Error('Valid user ID is required');
      }

      const { data, error } = await supabase?.from('resend_config')?.upsert({
          user_id: userId,
          sender_name: config?.senderName || 'PM Name (BetaPilot)',
          sender_email: config?.senderEmail || 'notifications@betapilot.com',
          is_verified: config?.isVerified || false,
          domain_verified: config?.domainVerified || false,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to update user config'
      };
    }
  }

  /**
   * Get Resend usage statistics for a user
   */
  async getUsageStats(userId, campaignId = null) {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        throw new Error('Valid user ID is required');
      }

      let query = supabase?.from('resend_api_usage')?.select('*')?.eq('user_id', userId);

      if (campaignId) {
        query = query?.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get usage stats'
      };
    }
  }

  /**
   * Get delivery status for sent emails
   */
  async getDeliveryStatus(userId, campaignId = null) {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        throw new Error('Valid user ID is required');
      }

      let query = supabase?.from('resend_invitations')?.select(`
          *,
          beta_invitations(
            id,
            customer_id,
            status
          )
        `)?.eq('user_id', userId);

      if (campaignId) {
        query = query?.eq('beta_invitations.beta_program_id', campaignId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get delivery status'
      };
    }
  }
}

export const resendEmailService = new ResendEmailService();