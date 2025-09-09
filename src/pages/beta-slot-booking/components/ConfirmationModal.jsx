import React from 'react';
import { X, Calendar, Clock, User, Mail, Phone, FileText, Loader } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ConfirmationModal = ({ 
  selectedSlot, 
  bookingData, 
  timezone, 
  betaProgram, 
  onConfirm, 
  onCancel, 
  submitting 
}) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Confirm Your Booking</h2>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Session Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-900">{betaProgram?.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-900">
                  {format(parseISO(selectedSlot?.slot_date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-900">
                  {formatTimeInTimezone(selectedSlot?.start_time)} - {formatTimeInTimezone(selectedSlot?.end_time)}
                </span>
              </div>
              {selectedSlot?.description && (
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-gray-500 mr-3 mt-0.5" />
                  <span className="text-sm text-gray-900">{selectedSlot?.description}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Timezone: {timezone}
              </div>
            </div>
          </div>

          {/* Participant Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Your Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-gray-900">{bookingData?.customerName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-gray-900">{bookingData?.customerEmail}</span>
              </div>
              {bookingData?.customerPhone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-900">{bookingData?.customerPhone}</span>
                </div>
              )}
              {bookingData?.notes && (
                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-gray-500 mr-3 mt-0.5" />
                  <span className="text-gray-900">{bookingData?.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Calendar invitation will be sent to your email</li>
              <li>• Meeting details and preparation instructions included</li>
              <li>• You can reschedule or cancel if needed</li>
              <li>• We'll send a reminder 1 day before your session</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;