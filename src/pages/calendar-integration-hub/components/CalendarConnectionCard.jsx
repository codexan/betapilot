import React from 'react';
import { Calendar, Check, X, Settings } from 'lucide-react';
import Button from '../../../components/ui/Button';

const CalendarConnectionCard = ({ 
  provider, 
  connected = false, 
  onConnect, 
  onDisconnect, 
  isManual = false 
}) => {
  const getProviderInfo = (provider) => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google Calendar',
          description: 'Sync with your Google Calendar account',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'outlook':
        return {
          name: 'Microsoft Outlook',
          description: 'Connect to Outlook Calendar',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'manual':
        return {
          name: 'Manual Scheduling',
          description: 'Manage time slots manually without calendar sync',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          name: 'Unknown Provider',
          description: 'Calendar provider',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const providerInfo = getProviderInfo(provider);

  return (
    <div className={`bg-white rounded-lg shadow border ${connected ? 'border-green-200' : providerInfo?.borderColor} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${providerInfo?.bgColor} mr-3`}>
            <Calendar className={`w-6 h-6 ${providerInfo?.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{providerInfo?.name}</h3>
            <p className="text-sm text-gray-600">{providerInfo?.description}</p>
          </div>
        </div>
        
        {connected ? (
          <div className="flex items-center text-green-600">
            <Check className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <X className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            connected 
              ? 'bg-green-100 text-green-800' :'bg-gray-100 text-gray-800'
          }`}>
            {connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {!isManual && (
          <div className="flex space-x-2">
            {connected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDisconnect?.(provider)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Configure', provider);
                    // Handle configuration
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => onConnect?.(provider)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Connect
              </Button>
            )}
          </div>
        )}

        {isManual && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('Configure manual scheduling');
              // Handle manual scheduling configuration
            }}
          >
            <Settings className="w-4 h-4 mr-1" />
            Configure
          </Button>
        )}
      </div>
      {connected && !isManual && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Last sync: {new Date()?.toLocaleDateString()} at {new Date()?.toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarConnectionCard;