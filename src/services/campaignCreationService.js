import { supabase } from '../lib/supabase';

class CampaignCreationService {
  // Create a new beta program (campaign)
  async createBetaProgram(data) {
    try {
      const { data: result, error } = await supabase?.from('beta_programs')?.insert([{
          name: data?.name,
          description: data?.description,
          start_date: data?.start_date,
          end_date: data?.end_date,
          is_active: true
        }])?.select('*')?.single();

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Create beta invitations for selected testers
  async createBetaInvitations(data) {
    console.log('track createBetaInvitations_data: ', data);
    try {
      const { data: result, error } = await supabase?.from('beta_invitations')?.insert(data?.invitations?.map(invitation => ({
          beta_program_id: invitation?.beta_program_id,
          customer_id: invitation?.customer_id,
          email_subject: invitation?.email_subject,
          email_content: invitation?.email_content,
          expires_at: invitation?.expires_at,
          status: 'draft'
        })))?.select('*');

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Send invitations (update status to sent)
  async sendInvitations(invitationIds) {
    try {
      const { data: result, error } = await supabase?.from('beta_invitations')?.update({
          status: 'sent',
          sent_at: new Date()?.toISOString()
        })?.in('id', invitationIds)?.select('*');

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get customers for tester selection
  async getCustomers() {
    try {
      const { data, error } = await supabase?.from('customers')?.select('id, first_name, last_name, email, job_title, participation_status, organization_id')?.order('first_name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Create NDA documents for selected testers
  async createNdaDocuments(data) {
    try {
      const { data: result, error } = await supabase?.from('nda_documents')?.insert(data?.ndas?.map(nda => ({
          beta_invitation_id: nda?.beta_invitation_id,
          customer_id: nda?.customer_id,
          nda_title: nda?.nda_title,
          nda_content: nda?.nda_content,
          expires_at: nda?.expires_at,
          status: 'pending'
        })))?.select('*');

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Create calendar slots for scheduling
  async createCalendarSlots(data) {
    try {
      const { data: result, error } = await supabase?.from('calendar_slots')?.insert(data?.slots?.map(slot => ({
          beta_program_id: slot?.beta_program_id,
          slot_date: slot?.slot_date,
          start_time: slot?.start_time,
          end_time: slot?.end_time,
          description: slot?.description,
          meeting_link: slot?.meeting_link,
          capacity: slot?.capacity || 1,
          status: 'available'
        })))?.select('*');

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get beta program details
  async getBetaProgram(id) {
    try {
      const { data, error } = await supabase?.from('beta_programs')?.select('*')?.eq('id', id)?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get invitations for a beta program
  async getBetaInvitations(betaProgramId) {
    try {
      const { data, error } = await supabase?.from('beta_invitations')?.select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)?.eq('beta_program_id', betaProgramId);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get all beta programs (campaigns)
async getAllCampaigns() {
  try {
    const { data, error } = await supabase
      .from('beta_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error?.message, data: [] };
  }
}


  // Get customers who received invitations for scheduling emails
  async getInvitedCustomers(betaProgramId) {
    try {
      const { data: invitations, error } = await supabase?.from('beta_invitations')?.select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            job_title
          )
        `)?.eq('beta_program_id', betaProgramId)?.in('status', ['sent', 'responded']);

      if (error) throw error;

      return {
        success: true,
        data: invitations?.map(inv => ({
          id: inv?.customers?.id,
          name: `${inv?.customers?.first_name} ${inv?.customers?.last_name}`,
          email: inv?.customers?.email,
          job_title: inv?.customers?.job_title,
          invitation_status: inv?.status,
          sent_at: inv?.sent_at,
          responded_at: inv?.responded_at
        })) || []
      };
    } catch (error) {
      return { success: false, error: error?.message, data: [] };
    }
  }

  // Update campaign draft
  // async updateCampaignDraft(betaProgramId, data) {
  //   try {
  //     const { data: result, error } = await supabase?.from('beta_programs')?.update({
  //         name: data?.name,
  //         description: data?.description,
  //         updated_at: new Date()?.toISOString()
  //       })?.eq('id', betaProgramId)?.select('*')?.single();

  //     if (error) throw error;
  //     return { success: true, data: result };
  //   } catch (error) {
  //     return { success: false, error: error?.message };
  //   }
  // }

  async updateCampaignDraft(betaProgramId, data) {
    try {
      if (!betaProgramId || typeof betaProgramId !== 'string') {
        throw new Error('Invalid betaProgramId');
      }
  
      const updatePayload = {
        updated_at: new Date().toISOString()
      };
  
      if (data?.name !== undefined) updatePayload.name = data.name;
      if (data?.description !== undefined) updatePayload.description = data.description;
  
      const { data: result, error } = await supabase
        .from('beta_programs')
        .update(updatePayload)
        .eq('id', betaProgramId)
        .select('*')
        .single();
  
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Update failed:', error);
      return { success: false, error: error?.message };
    }
  }
  
}

export const campaignCreationService = new CampaignCreationService();