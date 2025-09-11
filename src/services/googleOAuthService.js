import { supabase } from '../lib/supabase';

// Google OAuth configuration
const GOOGLE_OAUTH_CONFIG = {
  clientId: null, // Will be fetched from Supabase Edge Function
  redirectUri: `${window?.location?.origin}/oauth/google/callback`,
  scope: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]?.join(' ')
};

class GoogleOAuthService {
  // Get OAuth configuration from Supabase Edge Function
  async getOAuthConfig() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('oauth-config', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generate Google OAuth URL
  async generateAuthUrl() {
    try {
      const configResult = await this.getOAuthConfig();
      if (!configResult.success) {
        throw new Error(configResult.error);
      }

      const params = new URLSearchParams({
        client_id: configResult.clientId,
        redirect_uri: GOOGLE_OAUTH_CONFIG?.redirectUri,
        scope: GOOGLE_OAUTH_CONFIG?.scope,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true'
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params?.toString()}`;
    } catch (error) {
      throw new Error(`Failed to generate OAuth URL: ${error.message}`);
    }
  }

  // Exchange authorization code for tokens using Supabase Edge Function
  async exchangeCodeForTokens(code) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('oauth-token-exchange', {
        body: {
          code: code,
          redirectUri: GOOGLE_OAUTH_CONFIG?.redirectUri
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get user info from Google
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response?.ok) {
        throw new Error(`Failed to get user info: ${response?.statusText}`);
      }

      const userInfo = await response?.json();
      return { success: true, userInfo };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Store Google tokens in Supabase
  async storeGoogleTokens(tokens, userInfo) {
    try {
      const expiresAt = new Date(Date.now() + (tokens?.expires_in * 1000))?.toISOString();
      
      const { error } = await supabase?.from('user_profiles')?.update({
          google_access_token: tokens?.access_token,
          google_refresh_token: tokens?.refresh_token,
          google_token_expires_at: expiresAt,
          google_email: userInfo?.email,
          google_connected: true,
          google_connected_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    try {
      // Get current user's refresh token
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('google_refresh_token')?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id)?.single();

      if (profileError) throw profileError;
      if (!profile?.google_refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_OAUTH_CONFIG?.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET,
          refresh_token: profile?.google_refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!response?.ok) {
        throw new Error(`Token refresh failed: ${response?.statusText}`);
      }

      const tokens = await response?.json();
      
      // Update stored tokens
      const expiresAt = new Date(Date.now() + (tokens?.expires_in * 1000))?.toISOString();
      
      const { error: updateError } = await supabase?.from('user_profiles')?.update({
          google_access_token: tokens?.access_token,
          google_token_expires_at: expiresAt,
          updated_at: new Date()?.toISOString()
        })?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id);

      if (updateError) throw updateError;

      return { success: true, accessToken: tokens?.access_token };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken() {
    try {
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('google_access_token, google_token_expires_at, google_connected')?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id)?.single();

      if (profileError) throw profileError;
      if (!profile?.google_connected || !profile?.google_access_token) {
        return { success: false, error: 'Google account not connected' };
      }

      // Check if token is expired (with 5-minute buffer)
      const expiresAt = new Date(profile?.google_token_expires_at);
      const now = new Date();
      const bufferTime = 5 * 60 * 1000; // 5 minutes

      if (expiresAt?.getTime() <= (now?.getTime() + bufferTime)) {
        // Token is expired or will expire soon, refresh it
        return await this.refreshAccessToken();
      }

      return { success: true, accessToken: profile?.google_access_token };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Send email using Gmail API
  async sendEmail(emailData) {
    try {
      // Get valid access token
      const tokenResult = await this.getValidAccessToken();
      if (!tokenResult?.success) {
        return { success: false, error: tokenResult?.error };
      }

      // Create email message
      const emailMessage = this.createEmailMessage(emailData);
      
      // Send email via Gmail API
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenResult?.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: emailMessage
        })
      });

      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(`Gmail API error: ${errorData?.error?.message || response?.statusText}`);
      }

      const result = await response?.json();
      return { success: true, messageId: result?.id };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Create RFC 2822 formatted email message
  createEmailMessage({ to, subject, content, from = null }) {
    const boundary = `----=_Part_${Date.now()}_${Math.random()?.toString(36)}`;
    
    const headers = [
      `To: ${Array.isArray(to) ? to?.join(', ') : to}`,
      `Subject: ${subject}`,
      `From: ${from || 'PilotBeta Campaign'}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`
    ];

    const body = [
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      content?.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8', 
      'Content-Transfer-Encoding: 7bit',
      '',
      content,
      '',
      `--${boundary}--`
    ];

    const email = headers?.concat(body)?.join('\r\n');
    
    // Base64 encode the email (URL safe)
    return btoa(email)?.replace(/\+/g, '-')?.replace(/\//g, '_')?.replace(/=+$/, '');
  }

  // Send batch invitations
  async sendBatchInvitations(invitations, campaignData) {
    const results = [];
    
    for (const invitation of invitations) {
      try {
        // Prepare email content with template variables
        const emailContent = this.prepareEmailContent(invitation, campaignData);
        
        const emailResult = await this.sendEmail({
          to: invitation?.email,
          subject: campaignData?.emailSubject,
          content: emailContent,
          from: campaignData?.senderName
        });

        if (emailResult?.success) {
          // Store successful invitation in database
          await this.storeGmailInvitation({
            betaInvitationId: invitation?.betaInvitationId,
            recipientEmail: invitation?.email,
            subject: campaignData?.emailSubject,
            gmailMessageId: emailResult?.messageId,
            deliveryStatus: 'sent'
          });

          results?.push({
            email: invitation?.email,
            success: true,
            messageId: emailResult?.messageId
          });
        } else {
          // Store failed invitation
          await this.storeGmailInvitation({
            betaInvitationId: invitation?.betaInvitationId,
            recipientEmail: invitation?.email,
            subject: campaignData?.emailSubject,
            deliveryStatus: 'failed',
            errorMessage: emailResult?.error
          });

          results?.push({
            email: invitation?.email,
            success: false,
            error: emailResult?.error
          });
        }
      } catch (error) {
        results?.push({
          email: invitation?.email,
          success: false,
          error: error?.message
        });
      }
    }

    return results;
  }

  // Prepare email content with template variables
  prepareEmailContent(invitation, campaignData) {
    let content = campaignData?.emailContent || '';
    
    // Replace template variables
    content = content?.replace(/{{first_name}}/g, invitation?.firstName || '');
    content = content?.replace(/{{last_name}}/g, invitation?.lastName || '');
    content = content?.replace(/{{campaign_name}}/g, campaignData?.campaignName || '');
    content = content?.replace(/{{full_name}}/g, `${invitation?.firstName || ''} ${invitation?.lastName || ''}`?.trim());

    return content;
  }

  // Store Gmail invitation record
  async storeGmailInvitation(invitationData) {
    try {
      const { error } = await supabase?.from('gmail_invitations')?.insert({
          beta_invitation_id: invitationData?.betaInvitationId,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id,
          gmail_message_id: invitationData?.gmailMessageId,
          recipient_email: invitationData?.recipientEmail,
          subject: invitationData?.subject,
          delivery_status: invitationData?.deliveryStatus,
          error_message: invitationData?.errorMessage
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get user's Google connection status
  async getConnectionStatus() {
    try {
      const { data: profile, error } = await supabase?.from('user_profiles')?.select('google_connected, google_email, google_connected_at')?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id)?.single();

      if (error) throw error;

      return {
        success: true,
        isConnected: profile?.google_connected || false,
        email: profile?.google_email,
        connectedAt: profile?.google_connected_at
      };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Disconnect Google account
  async disconnect() {
    try {
      const { error } = await supabase?.rpc('disconnect_google_account');
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get Gmail API usage stats
  async getApiUsage(campaignId = null) {
    try {
      let query = supabase?.from('gmail_api_usage')?.select('*')?.eq('user_id', (await supabase?.auth?.getUser())?.data?.user?.id);

      if (campaignId) {
        query = query?.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();