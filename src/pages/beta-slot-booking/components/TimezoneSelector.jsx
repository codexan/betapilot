import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

const TimezoneSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timezones, setTimezones] = useState([]);

  useEffect(() => {
    // Get common timezones
    const commonTimezones = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'America/Toronto',
      'America/Vancouver',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland'
    ];

    // Format timezone names for display
    const formattedTimezones = commonTimezones?.map(tz => {
      try {
        const name = tz?.replace(/_/g, ' ')?.split('/')?.[1] || tz;
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
          timeZone: tz,
          timeZoneName: 'short'
        });
        const offset = formatter?.formatToParts(now)?.find(part => part?.type === 'timeZoneName')?.value;

        return {
          value: tz,
          label: `${name} (${offset})`,
          offset: now?.toLocaleString('en-US', { timeZone: tz })
        };
      } catch (err) {
        return {
          value: tz,
          label: tz,
          offset: ''
        };
      }
    });

    // Add user's detected timezone if not in the list
    const userTimezone = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone;
    if (userTimezone && !commonTimezones?.includes(userTimezone)) {
      try {
        const name = userTimezone?.replace(/_/g, ' ')?.split('/')?.[1] || userTimezone;
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
          timeZone: userTimezone,
          timeZoneName: 'short'
        });
        const offset = formatter?.formatToParts(now)?.find(part => part?.type === 'timeZoneName')?.value;

        formattedTimezones?.unshift({
          value: userTimezone,
          label: `${name} (${offset}) - Detected`,
          offset: now?.toLocaleString('en-US', { timeZone: userTimezone })
        });
      } catch (err) {
        // Ignore timezone formatting errors
      }
    }

    setTimezones(formattedTimezones);
  }, []);

  const selectedTimezone = timezones?.find(tz => tz?.value === value);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Clock className="h-4 w-4 text-gray-500 mr-2" />
        <span className="truncate max-w-32">
          {selectedTimezone?.label?.split(' (')?.[0] || 'Select timezone'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
            {timezones?.map(timezone => (
              <button
                key={timezone?.value}
                onClick={() => {
                  onChange?.(timezone?.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                  ${value === timezone?.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                <div className="truncate">{timezone?.label}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TimezoneSelector;