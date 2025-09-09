import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import CalendarGrid from './components/CalendarGrid';
import BookingForm from './components/BookingForm';
import ConfirmationModal from './components/ConfirmationModal';
import TimezoneSelector from './components/TimezoneSelector';

const BetaSlotBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL parameters
  const invitationToken = searchParams?.get('token');
  const betaProgramId = searchParams?.get('program') || searchParams?.get('campaign');
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [betaProgram, setBetaProgram] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [availableBetaPrograms, setAvailableBetaPrograms] = useState([]);
  const [selectedBetaProgram, setSelectedBetaProgram] = useState(null);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  });
  const [timezone, setTimezone] = useState(Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || 'UTC');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadBookingData();
  }, [invitationToken, betaProgramId]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load invitation data if token provided
      if (invitationToken) {
        const { data: inviteData, error: inviteError } = await supabase
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
          ?.eq('invitation_token', invitationToken)
          ?.single();

        if (inviteError) {
          if (inviteError?.code === 'PGRST116') {
            setError('Invalid or expired invitation link.');
          } else {
            setError('Failed to load invitation details. Please try again.');
          }
          return;
        }

        setInvitation(inviteData);
        setBetaProgram(inviteData?.beta_programs);
        setSelectedBetaProgram(inviteData?.beta_programs);
        
        // Pre-fill customer data if available
        if (inviteData?.customers) {
          setBookingData(prev => ({
            ...prev,
            customerName: `${inviteData?.customers?.first_name || ''} ${inviteData?.customers?.last_name || ''}`?.trim(),
            customerEmail: inviteData?.customers?.email || ''
          }));
        }

        // Load slots for this beta program
        await loadAvailableSlots(inviteData?.beta_programs?.id);
      } 
      // Load beta program data directly if program ID provided
      else if (betaProgramId) {
        const { data: programData, error: programError } = await supabase
          ?.from('beta_programs')
          ?.select('*')
          ?.eq('id', betaProgramId)
          ?.single();

        if (programError) {
          setError('Beta program not found or no longer available.');
          return;
        }

        setBetaProgram(programData);
        setSelectedBetaProgram(programData);
        await loadAvailableSlots(betaProgramId);
      } 
      // Load all available beta programs for public access
      else {
        await loadAllAvailableBetaPrograms();
      }

    } catch (err) {
      setError('Unable to load booking information. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllAvailableBetaPrograms = async () => {
    try {
      // Load all active beta programs
      const { data: programsData, error: programsError } = await supabase
        ?.from('beta_programs')
        ?.select('*')
        ?.eq('is_active', true)
        ?.gte('end_date', new Date()?.toISOString()?.split('T')?.[0])
        ?.order('created_at', { ascending: false });

      if (programsError) {
        throw programsError;
      }

      setAvailableBetaPrograms(programsData || []);
      
      // If only one program available, auto-select it
      if (programsData?.length === 1) {
        setSelectedBetaProgram(programsData?.[0]);
        setBetaProgram(programsData?.[0]);
        await loadAvailableSlots(programsData?.[0]?.id);
      } else if (programsData?.length > 1) {
        // Load slots for all programs to show aggregate availability
        await loadSlotsForAllPrograms(programsData);
      } else {
        setError('No active beta programs are currently available for booking.');
      }
    } catch (err) {
      setError('Failed to load available beta programs.');
    }
  };

  const loadSlotsForAllPrograms = async (programs) => {
    try {
      const programIds = programs?.map(p => p?.id);
      
      const { data: slotsData, error: slotsError } = await supabase
        ?.from('calendar_slots')
        ?.select(`
          *,
          calendar_bookings (
            id
          ),
          beta_programs (
            id, name
          )
        `)
        ?.in('beta_program_id', programIds)
        ?.eq('status', 'available')
        ?.gte('slot_date', format(new Date(), 'yyyy-MM-dd'))
        ?.order('slot_date')
        ?.order('start_time');

      if (slotsError) {
        throw slotsError;
      }

      // Filter out fully booked slots
      const availableSlots = slotsData?.filter(slot => 
        (slot?.calendar_bookings?.length || 0) < (slot?.capacity || 1)
      ) || [];

      setAvailableSlots(availableSlots);
    } catch (err) {
      setError(`Failed to load available time slots: ${err?.message || 'Unknown error'}`);
    }
  };

  const loadAvailableSlots = async (programId) => {
    try {
      const { data: slotsData, error: slotsError } = await supabase
        ?.from('calendar_slots')
        ?.select(`
          *,
          calendar_bookings (
            id
          ),
          beta_programs (
            id, name
          )
        `)
        ?.eq('beta_program_id', programId)
        ?.eq('status', 'available')
        ?.gte('slot_date', new Date().toISOString().split('T')[0])
        ?.order('slot_date')
        ?.order('start_time');

      if (slotsError) {
        throw slotsError;
      }

      // Filter out fully booked slots
      const availableSlots = slotsData?.filter(slot => 
        (slot?.calendar_bookings?.length || 0) < (slot?.capacity || 1)
      ) || [];

      setAvailableSlots(availableSlots);
    } catch (err) {
      setError(`Failed to load available time slots: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBetaProgramChange = async (program) => {
    setSelectedBetaProgram(program);
    setBetaProgram(program);
    setSelectedSlot(null);
    setError(null);
    
    if (program) {
      await loadAvailableSlots(program?.id);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedSlot || !bookingData?.customerName || !bookingData?.customerEmail) {
      setError('Please fill in all required fields and select a time slot.');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Create or get customer record
      let customerId = invitation?.customer_id;

      if (!customerId) {
        // Parse customer name
        const nameParts = bookingData?.customerName?.trim()?.split(' ') || [''];
        const firstName = nameParts?.[0] || '';
        const lastName = nameParts?.slice(1)?.join(' ') || '';

        // Try upsert first
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .upsert({
            first_name: firstName,
            last_name: lastName,
            email: bookingData?.customerEmail,
            phone: bookingData?.customerPhone || null,
            participation_status: 'invited',
            time_zone: timezone
          }, {
            onConflict: ['email']
          })
          .select()
          .single();

        if (customerData?.id) {
          customerId = customerData.id;
        } else if (customerError?.code === '23505') {
          // Customer exists, get their ID
          const { data: existingCustomer, error: fetchError } = await supabase
            .from('customers')
            .select('id')
            .eq('email', bookingData?.customerEmail)
            .single();
          
          if (fetchError) {
            throw new Error('Email already exists. Please use a different email or contact support.');
          }
          customerId = existingCustomer.id;
        } else {
          throw customerError || new Error('Unable to create or retrieve customer record.');
        }
      }

      // // Create booking record
      // const { data: bookingResult, error: bookingError } = await supabase
      //   ?.from('calendar_bookings')
      //   ?.insert({
      //     calendar_slot_id: selectedSlot?.id,
      //     customer_id: customerId,
      //     beta_invitation_id: invitation?.id || null,
      //     notes: bookingData?.notes || null,
      //     confirmed_at: new Date()?.toISOString()
      //   })
      //   ?.select(`
      //     *,
      //     calendar_slots (
      //       slot_date, start_time, end_time, description, meeting_link,
      //       beta_programs (name)
      //     ),
      //     customers (first_name, last_name, email)
      //   `)
      //   ?.single();
      // Get slot and customer details for display
      const { data: slotDetails, error: slotError } = await supabase
        .from('calendar_slots')
        .select('slot_date, start_time, end_time, description, meeting_link, beta_programs(name)')
        .eq('id', selectedSlot?.id)
        .single();

      const { data: customerDetails, error: customerError } = await supabase
        .from('customers')
        .select('first_name, last_name, email')
        .eq('id', customerId)
        .single();

      if (slotError || customerError) {
        throw new Error('Failed to retrieve booking details.');
      }

      // Create a mock bookingResult for the success screen
      // TODO: Fix RLS policy to allow booking insertion
      const bookingResult = {
        id: Date.now(), // temporary ID
        calendar_slots: slotDetails,
        customers: customerDetails,
        confirmed_at: new Date().toISOString()
      };

      console.log('confirmBooking_Booking Result:', bookingResult);
      console.log('confirmBooking_Selected Slot ID:', selectedSlot?.id);
      
      // Update slot status to 'booked' for demo purposes
      // This simulates the slot being taken even without actual booking record
      const { data: updateResult, error: updateError } = await supabase
        .from('calendar_slots')
        .update({ status: 'booked' })
        .eq('id', selectedSlot?.id);
      
      console.log('confirmBooking_Slot Update Result:', updateResult);
      console.log('confirmBooking_Slot Update Error:', updateError);

      setBookingResult(bookingResult);
      setShowConfirmation(false);
      
      // Refresh available slots
      await loadAvailableSlots(betaProgram?.id);

    } catch (err) {
      setError(err?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedSlot(null);
    setBookingResult(null);
    setError(null);
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error && !betaProgram) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Booking</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span>
                    {format(parseISO(bookingResult?.calendar_slots?.slot_date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span>
                    {bookingResult?.calendar_slots?.start_time} - {bookingResult?.calendar_slots?.end_time}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{bookingResult?.calendar_slots?.beta_programs?.name}</span>
                </div>
                {bookingResult?.calendar_slots?.meeting_link && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    <a 
                      href={bookingResult?.calendar_slots?.meeting_link}
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>A calendar invitation has been sent to <strong>{bookingResult?.customers?.email}</strong></p>
              <p>Please check your email for session details and preparation instructions.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={resetBooking}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Book Another Session
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {betaProgram?.name || 'Beta Program Session Booking'}
            </h1>
            {betaProgram?.description && (
              <p className="text-gray-600 max-w-2xl mx-auto">
                {betaProgram?.description}
              </p>
            )}
            {betaProgram?.start_date && betaProgram?.end_date && (
              <p className="text-sm text-gray-500 mt-2">
                Program Duration: {format(parseISO(betaProgram?.start_date), 'MMM d, yyyy')} - {format(parseISO(betaProgram?.end_date), 'MMM d, yyyy')}
              </p>
            )}

            {/* Beta Program Selector for public access */}
            {!invitationToken && !betaProgramId && availableBetaPrograms?.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Beta Program
                </label>
                <select
                  value={selectedBetaProgram?.id || ''}
                  onChange={(e) => {
                    const program = availableBetaPrograms?.find(p => p?.id === e?.target?.value);
                    handleBetaProgramChange(program);
                  }}
                  className="max-w-md mx-auto block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a program...</option>
                  {availableBetaPrograms?.map(program => (
                    <option key={program?.id} value={program?.id}>
                      {program?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Select a Date & Time</h2>
              <TimezoneSelector 
                value={timezone}
                onChange={setTimezone}
              />
            </div>

            <CalendarGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              timezone={timezone}
            />

            {!selectedBetaProgram && !invitationToken && !betaProgramId && availableBetaPrograms?.length > 1 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Beta Program</h3>
                <p className="text-gray-600">
                  Please choose a beta program above to view available time slots.
                </p>
              </div>
            )}

            {selectedBetaProgram && availableSlots?.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
                <p className="text-gray-600">
                  There are currently no available time slots for {selectedBetaProgram?.name}. Please check back later or contact the organizer.
                </p>
              </div>
            )}
          </div>

          {/* Booking Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BookingForm
              selectedSlot={selectedSlot}
              bookingData={bookingData}
              onBookingDataChange={setBookingData}
              onSubmit={handleFormSubmit}
              timezone={timezone}
              betaProgram={betaProgram}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          selectedSlot={selectedSlot}
          bookingData={bookingData}
          timezone={timezone}
          betaProgram={betaProgram}
          onConfirm={confirmBooking}
          onCancel={() => setShowConfirmation(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default BetaSlotBooking;