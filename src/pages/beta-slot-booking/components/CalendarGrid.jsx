import React from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';

const CalendarGrid = ({ 
  currentMonth, 
  onMonthChange, 
  availableSlots, 
  selectedSlot, 
  onSlotSelect, 
  timezone 
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const previousMonth = () => {
    onMonthChange?.(addDays(currentMonth, -30));
  };

  const nextMonth = () => {
    onMonthChange?.(addDays(currentMonth, 30));
  };

  const getSlotsForDay = (day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return availableSlots?.filter(slot => 
      slot?.slot_date === dayString
    ) || [];
  };

  const formatTimeInTimezone = (time) => {
    try {
      // Create a date object with the time (using today's date as base)
      const today = new Date();
      const [hours, minutes] = time?.split(':') || ['0', '0'];
      const datetime = new Date(today?.getFullYear(), today?.getMonth(), today?.getDate(), 
        parseInt(hours), parseInt(minutes));
      
      return datetime?.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: timezone 
      });
    } catch (err) {
      return time;
    }
  };

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays?.map(day => {
          const daySlots = getSlotsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = day < new Date()?.setHours(0, 0, 0, 0);
          const hasSlots = daySlots?.length > 0;

          return (
            <div
              key={day?.toISOString()}
              className={`
                min-h-[60px] p-1 border rounded-md relative
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isPast ? 'opacity-50' : ''}
                ${hasSlots && !isPast ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {format(day, 'd')}
              </div>
              
              {hasSlots && !isPast && (
                <div className="text-xs text-blue-600">
                  {daySlots?.length} slot{daySlots?.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Available Time Slots */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Available Time Slots</h4>
        
        {availableSlots?.length === 0 ? (
          <p className="text-gray-600 text-sm">No available slots found for the selected month.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Group slots by date */}
            {Object.entries(
              availableSlots?.reduce((acc, slot) => {
                const date = slot?.slot_date;
                if (!acc?.[date]) acc[date] = [];
                acc?.[date]?.push(slot);
                return acc;
              }, {}) || {}
            )?.map(([date, slots]) => (
              <div key={date}>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {format(parseISO(date), 'EEEE, MMMM d')}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slots?.map(slot => (
                    <button
                      key={slot?.id}
                      onClick={() => onSlotSelect?.(slot)}
                      className={`
                        p-3 text-left border rounded-md transition-all
                        ${selectedSlot?.id === slot?.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center mb-1">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium">
                          {formatTimeInTimezone(slot?.start_time)} - {formatTimeInTimezone(slot?.end_time)}
                        </span>
                      </div>
                      {slot?.description && (
                        <p className="text-xs text-gray-600 truncate">
                          {slot?.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {slot?.capacity > 1 && `${slot?.capacity} spots available`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarGrid;