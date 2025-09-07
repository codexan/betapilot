import { supabase } from '../lib/supabase.js';

class BetaOnboardingService {
  // Beta Invitations
  async createInvitation(invitationData) {
    try {
      const { data, error } = await supabase?.rpc('create_beta_invitation', {
        p_customer_id: invitationData?.customer_id,
        p_beta_program_id: invitationData?.beta_program_id,
        p_email_subject: invitationData?.email_subject,
        p_email_content: invitationData?.email_content
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating beta invitation:', error);
      throw error;
    }
  }

  async getInvitations(userId) {
    try {
      const { data, error } = await supabase?.from('beta_invitations')?.select(`
          *,
          customer:customers(id, first_name, last_name, email),
          beta_program:beta_programs(id, name),
          nda_documents(id, status, signed_at)
        `)?.eq('invited_by', userId)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching beta invitations:', error);
      throw error;
    }
  }

  async updateInvitationStatus(invitationId, status) {
    try {
      const { data, error } = await supabase?.from('beta_invitations')?.update({ 
          status,
          ...(status === 'sent' ? { sent_at: new Date()?.toISOString() } : {}),
          ...(status === 'responded' ? { responded_at: new Date()?.toISOString() } : {})
        })?.eq('id', invitationId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating invitation status:', error);
      throw error;
    }
  }

  // NDA Management
  async createNdaDocument(ndaData) {
    try {
      const { data, error } = await supabase?.from('nda_documents')?.insert({
          beta_invitation_id: ndaData?.beta_invitation_id,
          customer_id: ndaData?.customer_id,
          nda_title: ndaData?.nda_title,
          nda_content: ndaData?.nda_content,
          nda_file_url: ndaData?.nda_file_url,
          expires_at: ndaData?.expires_at
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating NDA document:', error);
      throw error;
    }
  }

  async getNdaDocuments(customerIds = []) {
    try {
      let query = supabase?.from('nda_documents')?.select(`
          *,
          customer:customers(id, first_name, last_name, email),
          beta_invitation:beta_invitations(id, beta_program:beta_programs(name))
        `)?.order('created_at', { ascending: false });

      if (customerIds?.length > 0) {
        query = query?.in('customer_id', customerIds);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching NDA documents:', error);
      throw error;
    }
  }

  async signNdaDocument(ndaId, signatureUrl) {
    try {
      const { data, error } = await supabase?.rpc('sign_nda_document', {
        p_nda_id: ndaId,
        p_signature_url: signatureUrl
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error signing NDA document:', error);
      throw error;
    }
  }

  // Calendar Management
  async createCalendarSlot(slotData) {
    try {
      const { data, error } = await supabase?.from('calendar_slots')?.insert({
          beta_program_id: slotData?.beta_program_id,
          created_by: slotData?.created_by,
          slot_date: slotData?.slot_date,
          start_time: slotData?.start_time,
          end_time: slotData?.end_time,
          capacity: slotData?.capacity || 1,
          description: slotData?.description,
          meeting_link: slotData?.meeting_link
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating calendar slot:', error);
      throw error;
    }
  }

  async getCalendarSlots(betaProgramId, startDate = null, endDate = null) {
    try {
      let query = supabase?.from('calendar_slots')?.select(`
          *,
          beta_program:beta_programs(id, name),
          bookings:calendar_bookings(id, customer:customers(first_name, last_name, email))
        `)?.eq('beta_program_id', betaProgramId)?.order('slot_date', { ascending: true })?.order('start_time', { ascending: true });

      if (startDate) {
        query = query?.gte('slot_date', startDate);
      }
      if (endDate) {
        query = query?.lte('slot_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching calendar slots:', error);
      throw error;
    }
  }

  async bookCalendarSlot(bookingData) {
    try {
      const { data, error } = await supabase?.from('calendar_bookings')?.insert({
          calendar_slot_id: bookingData?.calendar_slot_id,
          customer_id: bookingData?.customer_id,
          beta_invitation_id: bookingData?.beta_invitation_id,
          confirmed_at: new Date()?.toISOString(),
          notes: bookingData?.notes
        })?.select(`
          *,
          calendar_slot:calendar_slots(*),
          customer:customers(first_name, last_name, email)
        `)?.single();

      if (error) {
        throw error;
      }

      // Update slot status to booked if at capacity
      await this.updateSlotStatus(bookingData?.calendar_slot_id);

      return data;
    } catch (error) {
      console.error('Error booking calendar slot:', error);
      throw error;
    }
  }

  async updateSlotStatus(slotId) {
    try {
      // Check current bookings vs capacity
      const { data: slot, error: slotError } = await supabase?.from('calendar_slots')?.select('capacity, bookings:calendar_bookings(id)')?.eq('id', slotId)?.single();

      if (slotError) throw slotError;

      const bookedCount = slot?.bookings?.length || 0;
      const newStatus = bookedCount >= slot?.capacity ? 'booked' : 'available';

      const { error: updateError } = await supabase?.from('calendar_slots')?.update({ status: newStatus })?.eq('id', slotId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error updating slot status:', error);
      throw error;
    }
  }

  // File Upload for NDAs
  async uploadNdaFile(file, customerId) {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${customerId}/nda-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase?.storage?.from('nda-documents')?.upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase?.storage?.from('nda-documents')?.getPublicUrl(fileName);

      return {
        path: data?.path,
        url: urlData?.publicUrl
      };
    } catch (error) {
      console.error('Error uploading NDA file:', error);
      throw error;
    }
  }

  async getAvailableSlotsByProgram(betaProgramId) {
    try {
      const { data, error } = await supabase?.from('calendar_slots')?.select(`
          *,
          beta_program:beta_programs(name),
          bookings:calendar_bookings(id)
        `)?.eq('beta_program_id', betaProgramId)?.eq('status', 'available')?.gte('slot_date', new Date()?.toISOString()?.split('T')?.[0])?.order('slot_date', { ascending: true })?.order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  // Email Template Variables
  async getTemplateVariables(templateId) {
    try {
      const { data, error } = await supabase?.from('email_template_variables')?.select('*')?.eq('template_id', templateId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching template variables:', error);
      throw error;
    }
  }

  async saveTemplateVariables(templateId, variables) {
    try {
      // Delete existing variables
      await supabase?.from('email_template_variables')?.delete()?.eq('template_id', templateId);

      // Insert new variables
      if (variables?.length > 0) {
        const variablesToInsert = variables?.map(variable => ({
          template_id: templateId,
          variable_name: variable?.name,
          variable_value: variable?.value
        }));

        const { data, error } = await supabase?.from('email_template_variables')?.insert(variablesToInsert)?.select();

        if (error) {
          throw error;
        }

        return data;
      }

      return [];
    } catch (error) {
      console.error('Error saving template variables:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getOnboardingStats(userId) {
    try {
      const [
        invitationsResult,
        ndasResult,
        bookingsResult
      ] = await Promise.all([
        supabase?.from('beta_invitations')?.select('status')?.eq('invited_by', userId),
        supabase?.from('nda_documents')?.select('status, customer:customers!inner(created_by)')?.eq('customer.created_by', userId),
        supabase?.from('calendar_bookings')?.select('id, calendar_slot:calendar_slots!inner(created_by)')?.eq('calendar_slot.created_by', userId)
      ]);

      const invitations = invitationsResult?.data || [];
      const ndas = ndasResult?.data || [];
      const bookings = bookingsResult?.data || [];

      return {
        invitations: {
          total: invitations?.length,
          sent: invitations?.filter(i => i?.status === 'sent')?.length,
          responded: invitations?.filter(i => i?.status === 'responded')?.length,
          expired: invitations?.filter(i => i?.status === 'expired')?.length
        },
        ndas: {
          total: ndas?.length,
          pending: ndas?.filter(n => n?.status === 'pending')?.length,
          signed: ndas?.filter(n => n?.status === 'signed')?.length,
          expired: ndas?.filter(n => n?.status === 'expired')?.length
        },
        bookings: {
          total: bookings?.length
        }
      };
    } catch (error) {
      console.error('Error fetching onboarding stats:', error);
      return {
        invitations: { total: 0, sent: 0, responded: 0, expired: 0 },
        ndas: { total: 0, pending: 0, signed: 0, expired: 0 },
        bookings: { total: 0 }
      };
    }
  }
}

export default new BetaOnboardingService();