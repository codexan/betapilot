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
}

export const campaignCreationService = new CampaignCreationService();