import { supabase } from '../lib/supabase';

export const calendarIntegrationService = {
  // Email Templates
  async getEmailTemplates() {
    const { data, error } = await supabase?.from('email_templates')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createEmailTemplate(template) {
    const { data: userData } = await supabase?.auth?.getUser();
    const { data, error } = await supabase?.from('email_templates')?.insert({
        ...template,
        created_by: userData?.user?.id
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateEmailTemplate(id, updates) {
    const { data, error } = await supabase?.from('email_templates')?.update(updates)?.eq('id', id)?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Calendar Integrations
  async getCalendarIntegrations() {
    const { data, error } = await supabase?.from('calendar_integrations')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCalendarIntegration(integration) {
    const { data: userData } = await supabase?.auth?.getUser();
    const { data, error } = await supabase?.from('calendar_integrations')?.insert({
        ...integration,
        user_id: userData?.user?.id
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateCalendarIntegration(id, updates) {
    const { data, error } = await supabase?.from('calendar_integrations')?.update(updates)?.eq('id', id)?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Calendar Slots
  async getCalendarSlots(betaProgramId = null) {
    let query = supabase?.from('calendar_slots')?.select(`
        *,
        calendar_integrations(provider, provider_calendar_id),
        beta_programs(name)
      `)?.order('start_time', { ascending: true });

    if (betaProgramId) {
      query = query?.eq('beta_program_id', betaProgramId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createCalendarSlot(slot) {
    const { data, error } = await supabase?.from('calendar_slots')?.insert(slot)?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateCalendarSlot(id, updates) {
    const { data, error } = await supabase?.from('calendar_slots')?.update(updates)?.eq('id', id)?.select()?.single();

    if (error) throw error;
    return data;
  },

  async deleteCalendarSlot(id) {
    const { error } = await supabase?.from('calendar_slots')?.delete()?.eq('id', id);

    if (error) throw error;
  },

  // Beta Invitations
  async getBetaInvitations() {
    const { data, error } = await supabase?.from('beta_invitations')?.select(`
        *,
        beta_programs(name),
        customers(first_name, last_name, email),
        email_templates(name, subject_template)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBetaInvitation(invitation) {
    const { data: userData } = await supabase?.auth?.getUser();
    
    // Generate invitation token
    const { data: tokenData } = await supabase?.rpc('generate_invitation_token');
    
    const { data, error } = await supabase?.from('beta_invitations')?.insert({
        ...invitation,
        invited_by: userData?.user?.id,
        invitation_token: tokenData || Math.random()?.toString(36)?.substring(2)
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateBetaInvitation(id, updates) {
    const { data, error } = await supabase?.from('beta_invitations')?.update(updates)?.eq('id', id)?.select()?.single();

    if (error) throw error;
    return data;
  },

  async getInvitationByToken(token) {
    const { data, error } = await supabase?.from('beta_invitations')?.select(`
        *,
        beta_programs(name, description),
        customers(first_name, last_name, email)
      `)?.eq('invitation_token', token)?.single();

    if (error) throw error;
    return data;
  },

  // NDA Management
  async getNdaTemplates() {
    const { data, error } = await supabase?.from('nda_templates')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNdaTemplate(template) {
    const { data: userData } = await supabase?.auth?.getUser();
    const { data, error } = await supabase?.from('nda_templates')?.insert({
        ...template,
        created_by: userData?.user?.id
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async createNdaSignature(signature) {
    const { data, error } = await supabase?.from('nda_signatures')?.insert(signature)?.select()?.single();

    if (error) throw error;
    return data;
  },

  async getNdaSignatures() {
    const { data, error } = await supabase?.from('nda_signatures')?.select(`
        *,
        beta_invitations(beta_programs(name)),
        customers(first_name, last_name, email),
        nda_templates(name)
      `)?.order('signed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Slot Bookings
  async getSlotBookings() {
    const { data, error } = await supabase?.from('slot_bookings')?.select(`
        *,
        calendar_slots(start_time, end_time, beta_programs(name)),
        customers(first_name, last_name, email)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSlotBooking(booking) {
    // Generate booking token
    const { data: tokenData } = await supabase?.rpc('generate_booking_token');
    
    const { data, error } = await supabase?.from('slot_bookings')?.insert({
        ...booking,
        booking_token: tokenData || Math.random()?.toString(36)?.substring(2)
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateSlotBooking(id, updates) {
    const { data, error } = await supabase?.from('slot_bookings')?.update(updates)?.eq('id', id)?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Available slots for public booking
  async getAvailableSlots(betaProgramId) {
    const { data, error } = await supabase?.from('calendar_slots')?.select(`
        *,
        beta_programs(name),
        calendar_integrations(provider)
      `)?.eq('beta_program_id', betaProgramId)?.eq('status', 'available')?.gt('start_time', new Date()?.toISOString())?.order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Workflow progression
  async progressInvitationWorkflow(invitationId, nextStep, additionalData = {}) {
    const updates = {
      current_step: nextStep,
      ...additionalData
    };

    if (nextStep === 'invitation_accepted') {
      updates.accepted_at = new Date()?.toISOString();
    } else if (nextStep === 'nda_signed') {
      updates.nda_signed_at = new Date()?.toISOString();
    } else if (nextStep === 'slot_booked') {
      updates.slot_booked_at = new Date()?.toISOString();
    }

    return this.updateBetaInvitation(invitationId, updates);
  },

  // Statistics and Analytics
  async getWorkflowStats() {
    const { data: invitations, error } = await supabase?.from('beta_invitations')?.select('current_step');

    if (error) throw error;

    const stats = {
      invitation_sent: 0,
      invitation_accepted: 0,
      nda_sent: 0,
      nda_signed: 0,
      calendar_sent: 0,
      slot_booked: 0,
      session_completed: 0
    };

    invitations?.forEach(invitation => {
      stats[invitation.current_step] = (stats?.[invitation?.current_step] || 0) + 1;
    });

    return stats;
  },

  async getSlotUtilizationStats() {
    const { data: slots, error } = await supabase?.from('calendar_slots')?.select('capacity, booked_count, status');

    if (error) throw error;

    const totalSlots = slots?.length || 0;
    const totalCapacity = slots?.reduce((sum, slot) => sum + slot?.capacity, 0) || 0;
    const totalBooked = slots?.reduce((sum, slot) => sum + slot?.booked_count, 0) || 0;
    const availableSlots = slots?.filter(slot => slot?.status === 'available')?.length || 0;

    return {
      totalSlots,
      totalCapacity,
      totalBooked,
      availableSlots,
      utilizationRate: totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0
    };
  }
};

export default calendarIntegrationService;