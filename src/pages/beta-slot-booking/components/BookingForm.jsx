import React from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BookingForm = ({ 
  selectedSlot, 
  bookingData, 
  onBookingDataChange, 
  onSubmit, 
  timezone, 
  betaProgram 
}) => {
  const handleInputChange = (field, value) => {
    onBookingDataChange?.(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatTimeInTimezone = (time) => {
    try {
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
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Your Booking</h2>

      {/* Selected Slot Summary */}
      {selectedSlot ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Selected Session</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-blue-800">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {format(parseISO(selectedSlot?.slot_date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center text-blue-800">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {formatTimeInTimezone(selectedSlot?.start_time)} - {formatTimeInTimezone(selectedSlot?.end_time)}
              </span>
            </div>
            {selectedSlot?.description && (
              <div className="flex items-start text-blue-800">
                <FileText className="h-4 w-4 mr-2 mt-0.5" />
                <span>{selectedSlot?.description}</span>
              </div>
            )}
            {selectedSlot?.meeting_link && (
              <div className="flex items-center text-blue-800">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-xs">Meeting link will be provided after booking</span>
              </div>
            )}
          </div>
          <div className="text-xs text-blue-600 mt-3">
            Timezone: {timezone}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Please select a time slot from the calendar</p>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="customerName"
              required
              value={bookingData?.customerName || ''}
              onChange={(e) => handleInputChange('customerName', e?.target?.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              id="customerEmail"
              required
              value={bookingData?.customerEmail || ''}
              onChange={(e) => handleInputChange('customerEmail', e?.target?.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your.email@example.com"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            We'll send your calendar invitation and session details here
          </p>
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              id="customerPhone"
              value={bookingData?.customerPhone || ''}
              onChange={(e) => handleInputChange('customerPhone', e?.target?.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={bookingData?.notes || ''}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Any specific topics you'd like to discuss or questions you have..."
          />
        </div>

        {/* Session Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">What to Expect</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive a calendar invitation with meeting details</li>
            <li>• Please test your audio/video setup before the session</li>
            <li>• Bring any questions or feedback about the beta program</li>
            <li>• Session duration is typically 60 minutes</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedSlot || !bookingData?.customerName || !bookingData?.customerEmail}
          className={`
            w-full py-3 px-4 rounded-md font-medium transition-colors
            ${selectedSlot && bookingData?.customerName && bookingData?.customerEmail
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500' :'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {!selectedSlot ? 'Select a time slot to continue' : 'Book This Session'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;