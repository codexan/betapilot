import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';


export function InvitationForm({
  customers,
  betaPrograms,
  selectedCustomer,
  selectedProgram,
  onCustomerChange,
  onProgramChange,
  customSubject,
  customMessage,
  onSubjectChange,
  onMessageChange,
  sendTiming,
  scheduledDate,
  onSendTimingChange,
  onScheduledDateChange
}) {
  const customerOptions = customers?.map(customer => ({
    value: customer?.id,
    label: `${customer?.first_name} ${customer?.last_name} (${customer?.email})`
  })) || [];

  const programOptions = betaPrograms?.map(program => ({
    value: program?.id,
    label: program?.name
  })) || [];

  const timingOptions = [
    { value: 'immediate', label: 'Send Immediately' },
    { value: 'scheduled', label: 'Schedule for Later' }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Invitation Details</h2>
      <div className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Beta Tester *
          </label>
          <Select
            value={selectedCustomer}
            onChange={onCustomerChange}
            options={customerOptions}
            placeholder="Choose a customer..."
            className="w-full"
          />
          {customerOptions?.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No customers found. Add customers from the directory first.
            </p>
          )}
        </div>

        {/* Program Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beta Program *
          </label>
          <Select
            value={selectedProgram}
            onChange={onProgramChange}
            options={programOptions}
            placeholder="Choose a beta program..."
            className="w-full"
          />
        </div>

        {/* Custom Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject
          </label>
          <Input
            type="text"
            value={customSubject}
            onChange={(e) => onSubjectChange?.(e?.target?.value)}
            placeholder="Customize the email subject..."
            className="w-full"
          />
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Message
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => onMessageChange?.(e?.target?.value)}
            placeholder="Add a personal message (optional)..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use variables like {{customer_name}}, {{program_name}}, etc.
          </p>
        </div>

        {/* Send Timing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send Timing
          </label>
          <Select
            value={sendTiming}
            onChange={onSendTimingChange}
            options={timingOptions}
            className="w-full"
          />
        </div>

        {/* Scheduled Date */}
        {sendTiming === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date & Time
            </label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => onScheduledDateChange?.(e?.target?.value)}
              min={new Date()?.toISOString()?.slice(0, 16)}
              className="w-full"
            />
          </div>
        )}

        {/* Validation Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Smart Validation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Duplicate email checking prevents multiple invites to same customer</li>
                  <li>Email template variables will be automatically replaced</li>
                  <li>Invitation tracking will be enabled for follow-up workflows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}