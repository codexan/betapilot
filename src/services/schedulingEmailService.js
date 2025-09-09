import { supabase } from '../lib/supabase';
import { aiEmailService } from './aiEmailService';
import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);
const resend = import.meta.env.VITE_RESEND_API_KEY;



class SchedulingEmailService {
  /**
   * Validates that campaign invites were sent before allowing scheduling emails
   * @param {string} betaProgramId - The beta program ID
   * @returns {Promise<Object>} Validation result
   */
  // async validateCampaignInvites(betaProgramId) {
  //   try {
  //     if (!betaProgramId) {
  //       return {
  //         valid: false,
  //         message: 'No campaign found. Please set up the campaign first.',
  //         invitedUsers: []
  //       };
  //     }

  //     // Get all invitations for this beta program
  //     console.log('awaiting Supabase for beta_program_id: ', betaProgramId);
      
  //     // First try a simple query to test the basic structure
  //     const { data: invitations, error } = await supabase
  //       .from('beta_invitations')
  //       .select('*')
  //       .eq('beta_program_id', betaProgramId)
  //       .in('status', ['sent', 'responded']);
      
  //     console.log('Simple query result:', { invitations, error });
      
  //     // If the simple query works, try with the join
  //     if (!error && invitations) {
  //       const { data: invitationsWithCustomers, error: joinError } = await supabase
  //         .from('beta_invitations')
  //         .select(`
  //           *,
  //           customers (
  //             id,
  //             first_name,
  //             last_name,
  //             email,
  //             job_title
  //           )
  //         `)
  //         .eq('beta_program_id', betaProgramId)
  //         .in('status', ['sent', 'responded']);
          
  //         let finalInvitations = invitations;

  //         if (!joinError && invitationsWithCustomers) {
  //           finalInvitations = invitationsWithCustomers;
  //         }
          
  //       console.log('Join query result:', { invitationsWithCustomers, joinError });
  //     }

  //     if (error) throw error;

  //     console.log('invitations: ', invitations);

  //     return {
  //       valid: true,
  //       message: finalInvitations.length
  //         ? 'Campaign is valid for scheduling.'
  //         : 'No invites found, but scheduling is allowed.',
  //       invitedUsers: finalInvitations
  //     };
      

  //     // Filter users who have been sent invitations
  //     const invitedUsers = invitations?.filter(inv => inv?.customers && (inv?.status === 'sent' || inv?.status === 'responded'))?.map(inv => ({
  //         id: inv?.customers?.id,
  //         name: `${inv?.customers?.first_name} ${inv?.customers?.last_name}`,
  //         email: inv?.customers?.email,
  //         job_title: inv?.customers?.job_title,
  //         invitation_status: inv?.status,
  //         sent_at: inv?.sent_at,
  //         responded_at: inv?.responded_at
  //       }));

  //     return {
  //       valid: true,
  //       message: `Found ${invitedUsers?.length} users who received campaign invites.`,
  //       invitedUsers,
  //       totalInvites: invitations?.length
  //     };
  //   } catch (error) {
  //     console.error('Error validating campaign invites:', error);
  //     return {
  //       valid: false,
  //       message: 'Failed to validate campaign invites. Please try again.',
  //       invitedUsers: []
  //     };
  //   }
  // }

  async validateCampaignInvites(betaProgramId) {
    try {
      if (!betaProgramId) {
        return {
          valid: false,
          message: 'No campaign found. Please set up the campaign first.',
          invitedUsers: []
        };
      }
  
      console.log('awaiting Supabase for beta_program_id: ', betaProgramId);
  
      const { data: invitations, error } = await supabase
        .from('beta_invitations')
        .select('*')
        .eq('beta_program_id', betaProgramId)
        .in('status', ['sent', 'responded']);
  
      console.log('Simple query result:', { invitations, error });
  
      let finalInvitations = invitations || [];
  
      if (!error && invitations) {
        const { data: invitationsWithCustomers, error: joinError } = await supabase
          .from('beta_invitations')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              job_title
            )
          `)
          .eq('beta_program_id', betaProgramId)
          .in('status', ['sent', 'responded']);
  
        if (!joinError && invitationsWithCustomers) {
          finalInvitations = invitationsWithCustomers;
        }
  
        console.log('Join query result:', { invitationsWithCustomers, joinError });
      }
  
      if (error) throw error;
  
      console.log('Final invitations:', finalInvitations);
  
      return {
        valid: true,
        message: finalInvitations.length
          ? 'Campaign is valid for scheduling.'
          : 'No invites found, but scheduling is allowed.',
        invitedUsers: finalInvitations
      };
    } catch (error) {
      console.error('Error validating campaign invites:', error);
      return {
        valid: false,
        message: 'Failed to validate campaign invites. Please try again.',
        invitedUsers: []
      };
    }
  }

  /**
   * Gets available calendar slots for the campaign
   * @param {string} betaProgramId - The beta program ID
   * @returns {Promise<Object>} Available slots
   */
  async getAvailableSlots(betaProgramId) {
    try {
      const { data: slots, error } = await supabase?.from('calendar_slots')?.select('*')?.eq('beta_program_id', betaProgramId)?.eq('status', 'available')?.order('slot_date', { ascending: true })?.order('start_time', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        slots: slots || [],
        totalSlots: slots?.length || 0
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        slots: [],
        totalSlots: 0,
        error: error?.message
      };
    }
  }

  /**
   * Generates AI-powered scheduling email content
   * @param {Object} params - Parameters for email generation
   * @returns {Promise<Object>} Generated email content
   */
  // async generateSchedulingEmailContent(params) {
  //   const {
  //     betaProgramId,
  //     campaignName,
  //     availableSlots,
  //     customInstructions,
  //     emailOption = 'ai' // 'ai', 'template', 'custom'
  //   } = params;

  //   try {
  //     // Validate that campaign invites were sent
  //     const validation = await this.validateCampaignInvites(betaProgramId);
  //     if (!validation?.valid) {
  //       throw new Error(validation?.message);
  //     }

  //     // Get fresh slot data if not provided
  //     let slots = availableSlots;
  //     if (!slots?.length) {
  //       const slotsResult = await this.getAvailableSlots(betaProgramId);
  //       slots = slotsResult?.slots || [];
  //     }

  //     if (!slots?.length) {
  //       throw new Error('No available time slots found. Please create time slots first.');
  //     }

  //     let emailContent;

  //     switch (emailOption) {
  //       case 'ai':
  //         emailContent = await aiEmailService?.generateSchedulingEmail({
  //           campaignName,
  //           availableSlots: slots,
  //           companyName: 'BetaPilot',
  //           recipientCount: validation?.invitedUsers?.length,
  //           customInstructions
  //         });
  //         break;

  //       case 'template':
  //         emailContent = this.generateTemplateEmail({
  //           campaignName,
  //           availableSlots: slots,
  //           recipientCount: validation?.invitedUsers?.length
  //         });
  //         break;

  //       default:
  //         emailContent = await aiEmailService?.generateSchedulingEmail({
  //           campaignName,
  //           availableSlots: slots,
  //           companyName: 'BetaPilot',
  //           recipientCount: validation?.invitedUsers?.length,
  //           customInstructions
  //         });
  //     }

  //     return {
  //       success: true,
  //       emailContent,
  //       recipients: validation?.invitedUsers,
  //       availableSlots: slots,
  //       recipientCount: validation?.invitedUsers?.length
  //     };
  //   } catch (error) {
  //     console.error('Error generating scheduling email:', error);
  //     return {
  //       success: false,
  //       error: error?.message || 'Failed to generate scheduling email'
  //     };
  //   }
  // }
  async generateSchedulingEmailContent(params) {
    const {
      betaProgramId,
      campaignName,
      availableSlots,
      customInstructions,
      emailOption = 'ai' // 'ai', 'template', 'custom'
    } = params;
  
    try {
      const validation = await this.validateCampaignInvites(betaProgramId);
      if (!validation?.valid) {
        throw new Error(validation?.message);
      }
  
      let slots = availableSlots;
      if (!slots?.length) {
        const slotsResult = await this.getAvailableSlots(betaProgramId);
        slots = slotsResult?.slots || [];
      }
  
      if (!slots?.length) {
        throw new Error('No available time slots found. Please create time slots first.');
      }
  
      let emailContent;
  
      // ✅ Get Supabase access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const accessToken = session?.access_token;
  
      switch (emailOption) {
        case 'ai':
        default:
          emailContent = await aiEmailService.generateSchedulingEmail({
            campaignName,
            availableSlots: slots,
            companyName: 'BetaPilot',
            recipientCount: validation?.invitedUsers?.length,
            customInstructions,
            accessToken // ✅ pass token to AI service
          });
          break;
  
        case 'template':
          emailContent = this.generateTemplateEmail({
            campaignName,
            availableSlots: slots,
            recipientCount: validation?.invitedUsers?.length
          });
          break;
      }
  
      return {
        success: true,
        emailContent,
        recipients: validation?.invitedUsers,
        availableSlots: slots,
        recipientCount: validation?.invitedUsers?.length
      };
    } catch (error) {
      console.error('Error generating scheduling email:', error);
      return {
        success: false,
        error: error?.message || 'Failed to generate scheduling email'
      };
    }
  }
  


  /**
   * Generates a template-based scheduling email
   * @param {Object} params - Template parameters
   * @returns {Object} Template email content
   */
  generateTemplateEmail(params) {
    const { campaignName, availableSlots, recipientCount } = params;

    // Format slots for display
    const slotsByDate = availableSlots?.reduce((acc, slot) => {
      const date = new Date(slot?.slot_date)?.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc?.[date]) {
        acc[date] = [];
      }
      
      acc?.[date]?.push(`${slot?.start_time?.slice(0, 5)} - ${slot?.end_time?.slice(0, 5)}`);
      return acc;
    }, {});

    const slotsHtml = Object.entries(slotsByDate || {})?.map(([date, times]) => `
        <div style="margin-bottom: 15px;">
          <strong style="color: #2563eb; font-size: 16px;">${date}</strong>
          <div style="margin-top: 5px; margin-left: 10px;">
            ${times?.map(time => `<span style="display: inline-block; background: #f3f4f6; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 14px;">${time}</span>`)?.join('')}
          </div>
        </div>
      `)?.join('');

    const subject = `Book Your ${campaignName} Testing Session - Available Time Slots`;
    
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Time to Schedule Your Testing Session!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Great news! You've been selected for the <strong>${campaignName}</strong> beta testing program. 
            We're excited to have you on board and can't wait to get your valuable feedback.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            It's time to book your personal testing session. Please choose from one of the available time slots below:
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin-top: 0;">Available Time Slots</h3>
            ${slotsHtml}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/betapilot/testing-session" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
              Book Your Testing Session Now
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Note:</strong> Time slots are available on a first-come, first-served basis. 
              Book early to secure your preferred time!
            </p>
          </div>
          
          <h3 style="color: #1f2937;">What to Expect:</h3>
          <ul style="color: #374151; line-height: 1.6;">
            <li>30-60 minute testing session</li>
            <li>Screen sharing and task-based testing</li>
            <li>Opportunity to provide direct feedback</li>
            <li>Zoom meeting link will be sent after booking</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Have questions? Reply to this email or contact us at support@betapilot.com.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Thank you for being part of our beta testing community!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Best regards,<br>
              The BetaPilot Team
            </p>
          </div>
        </div>
      </div>
    `;

    return {
      subject,
      content,
      preview_text: `Book your ${campaignName} testing session from ${availableSlots?.length} available time slots`,
      call_to_action: 'Book Your Testing Session Now'
    };
  }

  /**
   * Sends scheduling emails to invited users
   * @param {Object} params - Email sending parameters
   * @returns {Promise<Object>} Send result
   */
  async sendSchedulingEmails(params) {
    const {
      betaProgramId,
      emailContent,
      recipients,
      testMode = false,
      accessToken 
    } = params;

    try {
      if (!recipients?.length) {
        throw new Error('No recipients found. Please validate campaign invites first.');
      }

      if (!emailContent?.subject || !emailContent?.content) {
        throw new Error('Email content is incomplete. Please generate content first.');
      }

      // Create scheduling email records
      const emailRecords = recipients?.map(recipient => ({
        beta_program_id: betaProgramId,
        recipient_email: recipient?.email,
        recipient_name: recipient?.name,
        email_subject: emailContent?.subject,
        email_content: emailContent?.content,
        email_type: 'scheduling',
        status: testMode ? 'draft' : 'pending',
        scheduled_at: new Date()?.toISOString()
      }));

      // Insert email records
      const { data: scheduledEmails, error: insertError } = await supabase?.from('scheduled_emails')?.insert(emailRecords)?.select('*');

      if (insertError) {
        throw insertError;
      }

      // In a real implementation, you would integrate with your email service here
      // For now, we'll update the status to 'sent'
      // if (!testMode) {
      //   const emailIds = scheduledEmails?.map(email => email?.id);
        
      //   const { error: updateError } = await supabase?.from('scheduled_emails')?.update({ 
      //       status: 'sent', 
      //       sent_at: new Date()?.toISOString() 
      //     })?.in('id', emailIds);

      //   if (updateError) {
      //     console.error('Error updating email status:', updateError);
      //   }
      // }

      if (!accessToken && !testMode) {
        throw new Error('Missing access token for protected email dispatch');
      }

      //Sending via Resend for Now:
      if (!testMode) {
        for (const email of scheduledEmails) {
          try {
            const sendResult = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-scheduling-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}` // if protected
              },
              body: JSON.stringify({
                to: email.recipient_email,
                subject: email.email_subject,
                html: email.email_content
              })
            });
            
            
      
            if (!sendResult.ok) {
              const errorText = await sendResult.text();
              console.error(`Resend function failed for ${email.recipient_email}:`, errorText);
            
              await supabase
                .from('scheduled_emails')
                .update({ status: 'failed' })
                .eq('id', email.id);
            } else {
              await supabase
                .from('scheduled_emails')
                .update({ 
                  status: 'sent', 
                  sent_at: new Date().toISOString() 
                })
                .eq('id', email.id);
            }
            
          } catch (err) {
            console.error(`Error sending email to ${email.recipient_email}:`, err);
            await supabase
              .from('scheduled_emails')
              .update({ status: 'error' })
              .eq('id', email.id);
          }
        }
      }
      

      return {
        success: true,
        message: testMode 
          ? `${recipients?.length} scheduling emails prepared (test mode)`
          : `${recipients?.length} scheduling emails sent successfully`,
        sentCount: recipients?.length,
        recipients,
        scheduledEmails
      };
    } catch (error) {
      console.error('Error sending scheduling emails:', error);
      return {
        success: false,
        error: error?.message || 'Failed to send scheduling emails'
      };
    }
  }

  /**
   * Gets the status of scheduled emails for a campaign
   * @param {string} betaProgramId - The beta program ID
   * @returns {Promise<Object>} Email status data
   */
  async getSchedulingEmailStatus(betaProgramId) {
    try {
      const { data: emails, error } = await supabase?.from('scheduled_emails')?.select('*')?.eq('beta_program_id', betaProgramId)?.eq('email_type', 'scheduling')?.order('created_at', { ascending: false });

      if (error) throw error;

      const stats = {
        total: emails?.length || 0,
        sent: emails?.filter(e => e?.status === 'sent')?.length || 0,
        pending: emails?.filter(e => e?.status === 'pending')?.length || 0,
        failed: emails?.filter(e => e?.status === 'failed')?.length || 0,
        draft: emails?.filter(e => e?.status === 'draft')?.length || 0
      };

      return {
        success: true,
        emails: emails || [],
        stats
      };
    } catch (error) {
      console.error('Error getting email status:', error);
      return {
        success: false,
        error: error?.message,
        emails: [],
        stats: { total: 0, sent: 0, pending: 0, failed: 0, draft: 0 }
      };
    }
  }
}

export const schedulingEmailService = new SchedulingEmailService();