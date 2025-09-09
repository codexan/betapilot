import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import AppIcon from '../../../components/AppIcon';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { schedulingEmailService } from '../../../services/schedulingEmailService';
import { campaignCreationService } from '../../../services/campaignCreationService';
import { supabase } from '../../../lib/supabase';



const ScheduleSlotStep = ({ data, updateData, onSendNow, campaignState, loading, onCampaignSelect }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [viewType, setViewType] = useState('calendar'); // calendar or list

  const [workStart, setWorkStart] = useState('09:00'); //to set user defined working hours
  const [workEnd, setWorkEnd] = useState('17:00');

  // Scheduling email states
  const [emailGenerated, setEmailGenerated] = useState(false);
  const [emailContent, setEmailContent] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [emailOption, setEmailOption] = useState('ai'); // 'ai', 'template', 'custom'
  const [customInstructions, setCustomInstructions] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);

  // Campaign selector states
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignTesters, setCampaignTesters] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Fetch campaigns once - Updated to use correct service method
    useEffect(() => {
      const loadAvailableCampaigns = async () => {
        try {
          setLoadingCampaigns(true);
          const result = await campaignCreationService?.getAllCampaigns();
          if (!result?.success || !Array.isArray(result?.data)) {
            console.warn('Campaign fetch failed or returned invalid data:', result);
            setCampaigns([]);
            return;
          }
          setCampaigns(result?.data);
          
          // Restore previously selected campaign from data
          const savedCampaignId = data?.selectedCampaignId || data?.betaProgramId || data?.savedCampaignId;
          if (savedCampaignId) {
            const savedCampaign = result?.data?.find(c => c?.id === savedCampaignId);
            if (savedCampaign) {
              setSelectedCampaign(savedCampaign);
              setSelectedCampaignId(savedCampaignId);
              // Trigger validation check for restored campaign
              setTimeout(() => checkCampaignInvites(savedCampaignId), 100);
              return; // Don't auto-select if we have a saved selection
            }
          }
          
          // Auto-select if only one campaign exists and no saved selection
          if (result?.data?.length === 1) {
            const campaign = result?.data?.[0];
            setSelectedCampaign(campaign);
            setSelectedCampaignId(campaign?.id);
            onCampaignSelect?.(campaign?.id);
          }
        } catch (err) {
          console.error('Failed to load campaigns', err);
        } finally {
          setLoadingCampaigns(false);
        }
      };
      
      loadAvailableCampaigns();
    }, []);
      
    
    // Load campaign-specific data when campaign is selected
  useEffect(() => {
    if (selectedCampaign?.id) {
      loadCampaignData(selectedCampaign?.id);
    }
  }, [selectedCampaign]);

  // Load campaign-specific data
  const loadCampaignData = async (campaignId) => {
    try {
      setLoadingCampaigns(true);
      
      // Load campaign invitations to get testers
      const invitationsResult = await campaignCreationService?.getBetaInvitations(campaignId);
      if (invitationsResult?.success) {
        const testers = invitationsResult?.data?.map(inv => ({
          id: inv?.customers?.id,
          name: `${inv?.customers?.first_name || ''} ${inv?.customers?.last_name || ''}`?.trim(),
          email: inv?.customers?.email,
          invitation_status: inv?.status,
          beta_invitation_id: inv?.id
        }));
        setCampaignTesters(testers);
      }
      
    } catch (error) {
      console.log('Failed to load campaign data:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  
   
   

  // Campaign selector useEffect
  // useEffect(() => {
  //   const fetchCampaigns = async () => {
  //     try {
  //       const result = await campaignCreationService.getAllCampaigns();
  //       if (result?.success) {
  //         setCampaigns(result.data);
  //       }
  //     } catch (err) {
  //       console.error('Failed to load campaigns', err);
  //     }
  //   };
  //   fetchCampaigns();
  // }, []);

  // Handle campaign selection change
  const handleCampaignChange = (campaignId) => {
    const campaign = campaigns?.find(c => c?.id === campaignId);
    setSelectedCampaign(campaign);
    setSelectedCampaignId(campaignId);
    
    if (campaignId) {
      onCampaignSelect?.(campaignId);       // loads campaignData + sets betaProgramId
      checkCampaignInvites(campaignId);     // runs validation immediately
    } else {
      setValidationStatus(null);
      setRecipients([]);
    }
    
    // Update parent component with selected campaign info
    updateData({ 
      selectedCampaignId: campaignId,
      selectedCampaignName: campaign?.name 
    });
  };
  


  // Initialize available slots from data
  useEffect(() => {
    if (data?.availableSlots) {
      setSelectedSlots(data?.availableSlots);
    }
  }, [data?.availableSlots]);

  // Check validation status when component mounts or betaProgramId changes
  // useEffect(() => {
  //   const campaignId = data?.betaProgramId || data?.savedCampaignId;
  //   if (campaignId) {
  //     checkCampaignInvites(campaignId);
  //   }
  //   console.log('checkCampaignInvites campaignId: ', campaignId);
  // }, [data?.betaProgramId, data?.savedCampaignId]);

// Add checkCampaignInvites function
const checkCampaignInvites = async (campaignId) => {
  try {
    // Get campaign invitations to check status
    const invitationsResult = await campaignCreationService?.getBetaInvitations(campaignId);
    
    if (invitationsResult?.success) {
      const invitations = invitationsResult?.data || [];
      const respondedCount = invitations?.filter(inv => inv?.status === 'responded')?.length;
      
      if (invitations?.length === 0) {
        setValidationStatus({
          valid: false,
          message: 'No invitations found for this campaign. Please send invites first.'
        });
      } else {
        setValidationStatus({
          valid: true,
          message: respondedCount > 0 ? `${respondedCount} tester(s) ready for scheduling` : `${invitations?.length} tester(s) invited - scheduling slots can be created`
        });
      }
    } else {
      setValidationStatus({
        valid: false,
        message: 'Unable to check campaign status'
      });
    }
  } catch (error) {
    console.error('Error checking campaign invites:', error);
    setValidationStatus({
      valid: false,
      message: 'Error validating campaign status'
    });
  }
};


  useEffect(() => {
    const campaignId = data?.betaProgramId || data?.savedCampaignId;
    if (campaignId && campaigns?.length > 0) {
      checkCampaignInvites(campaignId);
      console.log('checkCampaignInvites campaignId: ', campaignId);
      console.log('Matching campaign:', campaigns?.find(c => c?.id === campaignId));

    }
  }, [data?.betaProgramId, data?.savedCampaignId, campaigns]);
  

  // // Check if campaign invites were sent
  // const checkCampaignInvites = async () => {
  //   const campaignId = data?.betaProgramId || data?.savedCampaignId;
  //   if (!campaignId) return;

  //   try {
  //     const validation = await schedulingEmailService?.validateCampaignInvites(campaignId);
  //     setValidationStatus(validation);
      
  //     if (validation?.valid && validation?.invitedUsers) {
  //       setRecipients(validation?.invitedUsers);
  //     }
  //   } catch (error) {
  //     setValidationStatus({
  //       valid: false,
  //       message: 'Failed to validate campaign invites',
  //       invitedUsers: []
  //     });
  //   }
  // };

  // Generate time slots for a day
  const generateTimeSlots = (date, duration = 30, start = '09:00', end = '17:00') => {
    const slots = [];
    const [startHour, startMinute] = start?.split(':')?.map(Number);
    const [endHour, endMinute] = end?.split(':')?.map(Number)
  
    let currentHour = startHour;
    let currentMinute = startMinute;
  
    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const startTime = `${String(currentHour)?.padStart(2, '0')}:${String(currentMinute)?.padStart(2, '0')}`;
      const totalMinutes = currentHour * 60 + currentMinute + duration;
      const endTimeHour = Math.floor(totalMinutes / 60);
      const endTimeMinute = totalMinutes % 60;
      const endTime = `${String(endTimeHour)?.padStart(2, '0')}:${String(endTimeMinute)?.padStart(2, '0')}`;
  
      if (
        endTimeHour < endHour ||
        (endTimeHour === endHour && endTimeMinute <= endMinute)
      ) {
        slots?.push({
          id: `${date}-${startTime}`,
          date,
          startTime,
          endTime,
          duration,
          booked: false
        });
      }
  
      currentHour = endTimeHour;
      currentMinute = endTimeMinute;
    }
  
    return slots;
  };
  

  // Get dates for the next 30 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date?.setDate(today?.getDate() + i);
      
      // Skip weekends
      if (date?.getDay() !== 0 && date?.getDay() !== 6) {
        dates?.push({
          value: date?.toISOString()?.split('T')?.[0],
          label: date?.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  // Add multiple time slots for a date
  const handleAddDaySlots = () => {
    if (!selectedDate) return;
  
    const newSlots = generateTimeSlots(selectedDate, slotDuration, workStart, workEnd);
    const updatedSlots = [...selectedSlots];
  
    newSlots?.forEach(slot => {
      if (!updatedSlots?.some(existing => existing?.id === slot?.id)) {
        updatedSlots?.push(slot);
      }
    });
  
    setSelectedSlots(updatedSlots);
    updateData({ availableSlots: updatedSlots });

    // Reset email generation when slots change
    setEmailGenerated(false);
    setEmailContent(null);
  };
  

  // Add a single custom slot
  const handleAddCustomSlot = () => {
    if (!selectedDate || !startTime) return;
    
    const endTime = calculateEndTime(startTime, slotDuration);
    const newSlot = {
      id: `${selectedDate}-${startTime}`,
      date: selectedDate,
      startTime,
      endTime,
      duration: slotDuration,
      booked: false
    };
    
    if (!selectedSlots?.some(slot => slot?.id === newSlot?.id)) {
      const updatedSlots = [...selectedSlots, newSlot];
      setSelectedSlots(updatedSlots);
      updateData({ availableSlots: updatedSlots });

      // Reset email generation when slots change
      setEmailGenerated(false);
      setEmailContent(null);
    }
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime?.split(':')?.map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours?.toString()?.padStart(2, '0')}:${endMinutes?.toString()?.padStart(2, '0')}`;
  };

  // Remove a slot
  const handleRemoveSlot = (slotId) => {
    const updatedSlots = selectedSlots?.filter(slot => slot?.id !== slotId);
    setSelectedSlots(updatedSlots);
    updateData({ availableSlots: updatedSlots });

    // Reset email generation when slots change
    setEmailGenerated(false);
    setEmailContent(null);
  };

// Generate scheduling email content
const handleGenerateEmail = async () => {
  if (!validationStatus?.valid) {
    alert(validationStatus?.message || 'Please set up the campaign first');
    return;
  }

  if (!selectedSlots?.length) {
    alert('Please add time slots first');
    return;
  }

  setGenerateLoading(true);
  
  try {
    const result = await schedulingEmailService?.generateSchedulingEmailContent({
      betaProgramId: data?.betaProgramId || data?.savedCampaignId,
      campaignName: data?.name || 'Beta Testing Campaign',
      availableSlots: selectedSlots,
      customInstructions,
      emailOption
    });

    if (result?.success) {
      setEmailContent(result?.emailContent);
      setRecipients(result?.recipients || []);
      setEmailGenerated(true);
      setShowEmailPreview(true);
    } else {
      alert(result?.error || 'Failed to generate email content');
    }
  } catch (error) {
    console.error('Error generating email:', error);
    alert('Failed to generate email content. Please try again.');
  } finally {
    setGenerateLoading(false);
  }
};

// Handle send scheduling emails
const handleSendSchedulingEmails = async () => {
  if (!emailContent || !recipients?.length) {
    alert('Please generate email content first');
    return;
  }

  console.log('Sending scheduling emails with:', {
    betaProgramId: data?.betaProgramId || data?.savedCampaignId,
    emailContent,
    recipients
  });

  try {
    const {
      data: { session },
    } = await supabase?.auth?.getSession();
    
    const accessToken = session?.access_token;

    const result = await schedulingEmailService?.sendSchedulingEmails({
      betaProgramId: data?.betaProgramId || data?.savedCampaignId,
      emailContent,
      recipients,
      accessToken // ✅ now included  
    });
    
    

    console.log('Email sending result:', result);

    if (result?.success) {
      // Update campaign data with scheduling progress
      updateData({
        schedulingEmailsSent: result?.sentCount,
        schedulingRecipients: recipients,
        lastSchedulingEmail: new Date()?.toISOString()
      });
      
      alert(result?.message);
      
      // Call the parent's onSendNow to update progress
      if (onSendNow) {
        onSendNow();
      }
    } else {
      alert(result?.error || 'Failed to send scheduling emails');
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    alert('Failed to send scheduling emails. Please try again.');
  }
};


  // Group slots by date
  const slotsByDate = selectedSlots?.reduce((acc, slot) => {
    if (!acc?.[slot?.date]) {
      acc[slot.date] = [];
    }
    acc?.[slot?.date]?.push(slot);
    return acc;
  }, {});

  // Sort slots by time
  const sortSlotsByTime = (slots) => {
    return slots?.sort((a, b) => a?.startTime?.localeCompare(b?.startTime));
  };

  const availableDates = getAvailableDates();
  const totalSlots = selectedSlots?.length;
  const bookedSlots = selectedSlots?.filter(slot => slot?.booked)?.length;
  const availableSlots = totalSlots - bookedSlots;

  return (
    <div className="space-y-8">
    {/* Campaign Selection Section - Updated to match NDA workflow styling */}
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <AppIcon name="Target" size={20} className="text-primary" />
        <h3 className="text-lg font-medium text-foreground">Campaign Selection</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Campaign for Scheduling Step
          </label>
          <Select
            value={selectedCampaign?.id || ''}
            onChange={(value) => handleCampaignChange(value)}
            disabled={loadingCampaigns}
            placeholder={loadingCampaigns ? "Loading campaigns..." : "Select a campaign"}
            options={[
              { value: '', label: 'Select a campaign', disabled: true },
              ...campaigns?.map(campaign => ({
                value: campaign?.id,
                label: `${campaign?.name} ${campaign?.is_active ? '(Active)' : '(Draft)'}`
              }))
            ]}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Choose which campaign you want to create scheduling slots for. You can work on any step for any campaign.
          </p>
        </div>
        
        {selectedCampaign && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Selected Campaign</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{selectedCampaign?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${selectedCampaign?.is_active ? 'text-success' : 'text-warning'}`}>
                  {selectedCampaign?.is_active ? 'Active' : 'Draft'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invited Testers:</span>
                <span className="font-medium text-foreground">{campaignTesters?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responded:</span>
                <span className="font-medium text-primary">
                  {campaignTesters?.filter(t => t?.invitation_status === 'responded')?.length || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Validation Status Display */}
    {selectedCampaign && validationStatus && (
      <div className={`p-4 rounded-lg border ${
        validationStatus.valid
          ? 'bg-green-100 border-green-300 text-green-800'
          : 'bg-warning/30 border-warning/40 text-warning-foreground'
      }`}>
        <div className="flex items-center space-x-2">
          <AppIcon
            name={validationStatus.valid ? "CheckCircle" : "AlertTriangle"}
            size={16}
            className={validationStatus.valid ? "text-success" : "text-warning"}
          />
          <span className="text-sm font-medium">{validationStatus.message}</span>
        </div>
        {validationStatus.valid && campaignTesters?.filter(t => t?.invitation_status === 'responded')?.length > 0 && (
          <div className="mt-2 text-xs">
            Ready to create scheduling slots for {campaignTesters?.filter(t => t?.invitation_status === 'responded')?.length} beta testers who responded to campaign invites.
          </div>
        )}
      </div>
    )}

    {/* Campaign Selection Prompt */}
    {!selectedCampaign && campaigns?.length > 1 && (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AppIcon name="Info" size={16} className="text-warning" />
          <span className="text-sm font-medium text-warning">Campaign Selection Required</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Please select a campaign above to see relevant testers and create scheduling slots for that specific campaign.
        </p>
      </div>
    )}
    {/* Slot Configuration */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Slot Settings */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Slot Configuration</h3>
          
          <div className="space-y-4">
            {/* User defined working hours */}
          <Input
            label="Work Start Time"
            type="time"
            value={workStart}
            onChange={(e) => setWorkStart(e?.target?.value)}
          />

          <Input
            label="Work End Time"
            type="time"
            value={workEnd}
            onChange={(e) => setWorkEnd(e?.target?.value)}
          />


            {/* Duration Setting */}
            <Select
              label="Slot Duration"
              value={slotDuration?.toString()}
              onChange={(value) => setSlotDuration(Number(value))}
              options={[
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '90', label: '1.5 hours' },
                { value: '120', label: '2 hours' }
              ]}
            />

            {/* Date Selection */}
            {/* <Select
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              options={[
                { value: '', label: 'Choose a date' },
                ...availableDates
              ]}
            /> */}
            {/* <Input
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // today
            /> */}
            <DatePicker
              selected={selectedDate ? new Date(selectedDate) : null}
              onChange={(date) => setSelectedDate(date?.toISOString()?.split('T')?.[0])}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
            />

            {/* Time Selection for Custom Slot */}
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e?.target?.value)}
              min="09:00"
              max="17:00"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAddDaySlots}
            disabled={!selectedDate}
            className="w-full"
            iconName="Calendar"
            iconPosition="left"
            iconSize={16}
          >
            Add Full Day Slots
          </Button>
          
          <Button
            variant="outline"
            onClick={handleAddCustomSlot}
            disabled={!selectedDate || !startTime}
            className="w-full"
            iconName="Clock"
            iconPosition="left"
            iconSize={16}
          >
            Add Custom Slot
          </Button>
        </div>

{/* Email Generation Section */}
{validationStatus?.valid && totalSlots > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Scheduling Email</h4>
            
            <div className="space-y-3">
              <Select
                label="Email Type"
                value={emailOption}
                onChange={setEmailOption}
                options={[
                  { value: 'ai', label: 'AI Generated (Recommended)' },
                  { value: 'template', label: 'Professional Template' }
                ]}
              />
              
              {emailOption === 'ai' && (
                <Input
                  label="Custom Instructions (Optional)"
                  placeholder="e.g., Make it more casual, emphasize urgency..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e?.target?.value)}
                />
              )}
              
              <Button
                onClick={handleGenerateEmail}
                disabled={generateLoading || !totalSlots}
                className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                iconName={generateLoading ? "Loader2" : "Sparkles"}
                iconPosition="left"
                iconSize={14}
              >
                {generateLoading ? 'Generating...' : 'Generate Email with AI'}
              </Button>
              
              {emailGenerated && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="w-full text-xs"
                    iconName="Eye"
                    iconPosition="left"
                    iconSize={12}
                  >
                    {showEmailPreview ? 'Hide Preview' : 'Show Email Preview'}
                  </Button>
                  
                  <Button
                    onClick={handleSendSchedulingEmails}
                    disabled={loading || !emailContent}
                    className="w-full bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                    iconName="Send"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Send to {recipients?.length} Recipients
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slot Statistics */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3">Slot Statistics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Slots:</span>
              <span className="text-sm font-medium text-foreground">{totalSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available:</span>
              <span className="text-sm font-medium text-success">{availableSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Booked:</span>
              <span className="text-sm font-medium text-warning">{bookedSlots}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Slot Calendar/List */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Available Time Slots</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewType === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('calendar')}
              iconName="Calendar"
              iconPosition="left"
              iconSize={14}
            >
              Calendar
            </Button>
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('list')}
              iconName="List"
              iconPosition="left"
              iconSize={14}
            >
              List
            </Button>
          </div>
        </div>

        {/* Slot Display */}
        {totalSlots === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-muted rounded-lg">
            <AppIcon name="CalendarX" size={48} className="text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Slots Defined</h4>
            <p className="text-sm text-muted-foreground max-w-md">
              Add time slots for beta testers to book their testing sessions. 
              You can add individual slots or generate slots for entire days.
            </p>
          </div>
        ) : viewType === 'calendar' ? (
          <div className="space-y-6">
            {Object.entries(slotsByDate)?.sort(([a], [b]) => a?.localeCompare(b))?.map(([date, slots]) => (
                <div key={date} className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">
                    {new Date(date)?.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sortSlotsByTime(slots)?.map((slot) => (
                      <div
                        key={slot?.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          slot?.booked 
                            ? 'bg-warning/10 border-warning/20' :'bg-success/10 border-success/20'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {slot?.startTime} - {slot?.endTime}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot?.duration}min
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(slot?.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <AppIcon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg">
            <div className="max-h-96 overflow-y-auto">
              {selectedSlots?.sort((a, b) => {
                  const dateCompare = a?.date?.localeCompare(b?.date);
                  return dateCompare === 0 ? a?.startTime?.localeCompare(b?.startTime) : dateCompare;
                })?.map((slot, index) => (
                  <div
                    key={slot?.id}
                    className={`flex items-center justify-between p-4 ${
                      index < selectedSlots?.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        slot?.booked ? 'bg-warning' : 'bg-success'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(slot.date)?.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric' 
                          })} • {slot?.startTime} - {slot?.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot?.duration} minutes • {slot?.booked ? 'Booked' : 'Available'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(slot?.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <AppIcon name="Trash2" size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Email Preview Modal */}
    {showEmailPreview && emailContent && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">Email Preview</h3>
            <button
              onClick={() => setShowEmailPreview(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <AppIcon name="X" size={20} />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Subject:</div>
              <div className="font-medium text-foreground">{emailContent?.subject}</div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Recipients: {recipients?.length} beta testers</div>
            </div>
            
            <div className="border border-border rounded-lg p-4 bg-background">
              <div dangerouslySetInnerHTML={{ __html: emailContent?.content }} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setShowEmailPreview(false)}
            >
              Close
            </Button>
            
            <Button
              onClick={handleSendSchedulingEmails}
              disabled={loading || !emailContent}
              className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
              iconName="Send"
              iconPosition="left"
              iconSize={14}
            >
              Send to {recipients?.length} Recipients
            </Button>
          </div>
        </div>
      </div>
    )}
    {/* Enhanced Schedule Summary with Actions */}
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-foreground">Schedule Summary</h4>
          {selectedCampaign && (
            <p className="text-sm text-muted-foreground">
              Working on: <span className="text-foreground font-medium">{selectedCampaign?.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <AppIcon name="Calendar" size={16} className="text-primary" />
            <span className="font-medium text-foreground">
              {data?.availableSlots?.length || 0} slots configured
            </span>
          </div>

          {validationStatus?.valid && totalSlots > 0 && !emailGenerated && (
            <Button
              variant="outline"
              size="sm" 
              onClick={handleGenerateEmail}
              disabled={generateLoading}
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              iconName="Sparkles"
              iconPosition="left"
              iconSize={14}
            >
              Generate Email with AI
            </Button>
          )}

          
          {emailGenerated && (
            <Button
              variant="outline"
              size="sm" 
              onClick={handleSendSchedulingEmails}
              disabled={loading || !emailContent}
              className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
              iconName="Send"
              iconPosition="left"
              iconSize={14}
            >
              Send Scheduling Email Now
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Available Slots:</span>
          <p className="font-medium text-foreground">
            {data?.availableSlots?.length || 0}
          </p>
        </div>
        <div>
        <span className="text-muted-foreground">Recipients Ready:</span>
          <p className="font-medium text-foreground">
            {recipients?.length || 0}
            {selectedCampaign && (
              <span className="text-xs text-muted-foreground ml-1">
                (Campaign: {selectedCampaign?.name})
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Emails Sent:</span>
          <p className="font-medium text-foreground">
            {data?.schedulingEmailsSent || 0}
          </p>
        </div>
        <div>
        <span className="text-muted-foreground">Email Status:</span>
          <p className="font-medium text-foreground">
            {emailGenerated ? 'Ready' : 'Not Generated'}
          </p>
        </div>
      </div>

      {/* Progress Status for Scheduling */}
      {(data?.schedulingEmailsSent > 0) && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedCampaign ? `${selectedCampaign?.name} Progress:` : 'Scheduling Progress:'}
          </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-foreground">Emails Sent: {data?.schedulingEmailsSent || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-foreground">Pending Bookings: {(recipients?.length || 0) - (data?.schedulingEmailsSent || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    {/* Booking Instructions */}
    {totalSlots > 0 && (
      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AppIcon name="Info" size={16} className="text-info mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">How Slot Booking Works</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Beta testers will receive booking links after campaign launch</li>
              <li>• Each tester can book one available slot that fits their schedule</li>
              <li>• Zoom links will be automatically generated for each booking</li>
              <li>• Calendar invites will be sent to both you and the tester</li>
            </ul>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ScheduleSlotStep;