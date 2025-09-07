import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import AppIcon from '../../../components/AppIcon';

const ScheduleSlotStep = ({ data, updateData, onSendNow, campaignState, loading }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [viewType, setViewType] = useState('calendar'); // calendar or list

  // Initialize available slots from data
  useEffect(() => {
    if (data?.availableSlots) {
      setSelectedSlots(data?.availableSlots);
    }
  }, [data?.availableSlots]);

  // Generate time slots for a day
  const generateTimeSlots = (date, duration = 30) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const startTime = `${hour?.toString()?.padStart(2, '0')}:${minute?.toString()?.padStart(2, '0')}`;
        const endMinute = minute + duration;
        const endTimeHour = endMinute >= 60 ? hour + 1 : hour;
        const endTimeMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endTimeHour?.toString()?.padStart(2, '0')}:${endTimeMinute?.toString()?.padStart(2, '0')}`;
        
        if (endTimeHour <= endHour) {
          slots?.push({
            id: `${date}-${startTime}`,
            date,
            startTime,
            endTime,
            duration,
            booked: false
          });
        }
      }
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
    
    const newSlots = generateTimeSlots(selectedDate, slotDuration);
    const updatedSlots = [...selectedSlots];
    
    newSlots?.forEach(slot => {
      if (!updatedSlots?.some(existing => existing?.id === slot?.id)) {
        updatedSlots?.push(slot);
      }
    });
    
    setSelectedSlots(updatedSlots);
    updateData({ availableSlots: updatedSlots });
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
      {/* Slot Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Slot Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Slot Configuration</h3>
            
            <div className="space-y-4">
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
              <Select
                label="Select Date"
                value={selectedDate}
                onChange={setSelectedDate}
                options={[
                  { value: '', label: 'Choose a date' },
                  ...availableDates
                ]}
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
      
      {/* Enhanced Schedule Summary with Actions */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Schedule Summary</h4>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm">
              <AppIcon name="Calendar" size={16} className="text-primary" />
              <span className="font-medium text-foreground">
                {data?.availableSlots?.length || 0} slots configured
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm" 
              onClick={onSendNow}
              disabled={loading || !data?.availableSlots?.length}
              className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
              iconName="Send"
              iconPosition="left"
              iconSize={14}
            >
              Send Scheduling Email Now
            </Button>
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
            <span className="text-muted-foreground">Slot Duration:</span>
            <p className="font-medium text-foreground">
              {data?.slotDuration || 30}m blocks
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Slots Filled:</span>
            <p className="font-medium text-foreground">
              {data?.slotsFilled || 0}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Remaining:</span>
            <p className="font-medium text-foreground">
              {(data?.availableSlots?.length || 0) - (data?.slotsFilled || 0)}
            </p>
          </div>
        </div>

        {/* Progress Status for Slots */}
        {(data?.slotsFilled > 0 || data?.slotsRemaining > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress Status:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Slots Filled: {data?.slotsFilled || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-foreground">Remaining: {data?.slotsRemaining || data?.availableSlots?.length || 0}</span>
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