import { supabase } from '../lib/supabase';

export const betaSlotBookingService = {
  // Get invitation details by token
  async getInvitationByToken(token) {
    try {
      console.log('Fetching invitation details for token:', token);
      const { data, error } = await supabase
        ?.from('beta_invitations')
        ?.select(`
          *,
          beta_programs (
            id, name, description, start_date, end_date
          ),
          customers (
            first_name, last_name, email, phone
          )
        `)
        ?.eq('invitation_token', token)
        ?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to load invitation details');
    }
  },

  // Get beta program details
  async getBetaProgram(programId) {
    try {
      const { data, error } = await supabase
        ?.from('beta_programs')
        ?.select('*')
        ?.eq('id', programId)
        ?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to load beta program details');
    }
  },

  // Get available calendar slots for a beta program
  async getAvailableSlots(betaProgramId) {
    try {
      const { data, error } = await supabase
        ?.from('calendar_slots')
        ?.select(`
          *,
          calendar_bookings (
            id
          )
        `)
        ?.eq('beta_program_id', betaProgramId)
        ?.eq('status', 'available')
        ?.gte('slot_date', new Date()?.toISOString()?.split('T')?.[0])
        ?.order('slot_date')
        ?.order('start_time');

      if (error) {
        throw error;
      }

      // Filter out fully booked slots
      const availableSlots = data?.filter(slot => {
        const currentBookings = slot?.calendar_bookings?.filter(booking => 
          !booking?.cancelled_at
        )?.length || 0;
        return currentBookings < (slot?.capacity || 1);
      }) || [];

      return availableSlots;
    } catch (err) {
      throw new Error(err?.message || 'Failed to load available slots');
    }
  },

  // Create or find customer
  async createOrFindCustomer(customerData, timezone) {
    try {
      const nameParts = customerData?.customerName?.trim()?.split(' ') || [''];
      const firstName = nameParts?.[0] || '';
      const lastName = nameParts?.slice(1)?.join(' ') || '';

      // Try to find existing customer first
      const { data: existingCustomer, error: findError } = await supabase
        ?.from('customers')
        ?.select('id')
        ?.eq('email', customerData?.customerEmail)
        ?.single();

      if (existingCustomer && !findError) {
        return existingCustomer?.id;
      }

      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        ?.from('customers')
        ?.insert({
          first_name: firstName,
          last_name: lastName,
          email: customerData?.customerEmail,
          phone: customerData?.customerPhone || null,
          participation_status: 'invited',
          time_zone: timezone
        })
        ?.select()
        ?.single();

      if (createError) {
        throw createError;
      }

      return newCustomer?.id;
    } catch (err) {
      throw new Error(err?.message || 'Failed to create customer record');
    }
  },

  // Create booking
  async createBooking(slotId, customerId, invitationId, notes) {
    try {
      const { data, error } = await supabase
        ?.from('calendar_bookings')
        ?.insert({
          calendar_slot_id: slotId,
          customer_id: customerId,
          beta_invitation_id: invitationId || null,
          notes: notes || null,
          confirmed_at: new Date()?.toISOString()
        })
        ?.select(`
          *,
          calendar_slots (
            slot_date, start_time, end_time, description, meeting_link,
            beta_programs (name)
          ),
          customers (first_name, last_name, email)
        `)
        ?.single();

      if (error) {
        if (error?.code === '23505') {
          throw new Error('This time slot has just been booked by another participant. Please select a different slot.');
        }
        throw error;
      }

      // Update slot status if fully booked
      await this.updateSlotAvailability(slotId);

      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to create booking');
    }
  },

  // Update slot availability
  async updateSlotAvailability(slotId) {
    try {
      // Get current bookings count
      const { data: bookings, error: bookingsError } = await supabase
        ?.from('calendar_bookings')
        ?.select('id')
        ?.eq('calendar_slot_id', slotId)
        ?.is('cancelled_at', null);

      if (bookingsError) {
        throw bookingsError;
      }

      // Get slot capacity
      const { data: slot, error: slotError } = await supabase
        ?.from('calendar_slots')
        ?.select('capacity')
        ?.eq('id', slotId)
        ?.single();

      if (slotError) {
        throw slotError;
      }

      const currentBookings = bookings?.length || 0;
      const capacity = slot?.capacity || 1;

      // Update slot status if fully booked
      if (currentBookings >= capacity) {
        await supabase
          ?.from('calendar_slots')
          ?.update({ status: 'booked' })
          ?.eq('id', slotId);
      }
    } catch (err) {
      // Don't throw error for slot availability update
      console.error('Failed to update slot availability:', err);
    }
  },

  // Get booking by ID
  async getBooking(bookingId) {
    try {
      const { data, error } = await supabase
        ?.from('calendar_bookings')?.select(`*,calendar_slots (slot_date, start_time, end_time, description, meeting_link,beta_programs (name)),customers (first_name, last_name, email)`)?.eq('id', bookingId)
        ?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to load booking details');
    }
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const { data, error } = await supabase
        ?.from('calendar_bookings')
        ?.update({ 
          cancelled_at: new Date()?.toISOString() 
        })
        ?.eq('id', bookingId)
        ?.select(`
          *,
          calendar_slots (id, capacity)
        `)
        ?.single();

      if (error) {
        throw error;
      }

      // Update slot status to available if it was fully booked
      if (data?.calendar_slots) {
        await supabase
          ?.from('calendar_slots')
          ?.update({ status: 'available' })
          ?.eq('id', data?.calendar_slots?.id);
      }

      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to cancel booking');
    }
  },

  // Get customer bookings
  async getCustomerBookings(customerEmail) {
    try {
      const { data, error } = await supabase
        ?.from('calendar_bookings')?.select(`*,calendar_slots (slot_date, start_time, end_time, description,beta_programs (name)),customers!inner (email)`)?.eq('customers.email', customerEmail)?.is('cancelled_at', null)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      throw new Error(err?.message || 'Failed to load customer bookings');
    }
  }
};

export default betaSlotBookingService;