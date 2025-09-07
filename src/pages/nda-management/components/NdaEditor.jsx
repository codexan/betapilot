import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export function NdaEditor({
  title,
  content,
  isEditing,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
  onEdit,
  onCancel,
  customers,
  onSendForSignature
}) {
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const customerOptions = customers?.map(customer => ({
    value: customer?.id,
    label: `${customer?.first_name} ${customer?.last_name} (${customer?.email})`
  })) || [];

  const handleSendForSignature = () => {
    if (!selectedCustomer) {
      alert('Please select a customer to send the NDA to.');
      return;
    }
    onSendForSignature?.(selectedCustomer);
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('nda-content');
    if (textarea) {
      const start = textarea?.selectionStart;
      const end = textarea?.selectionEnd;
      const newContent = content?.substring(0, start) + `{{${variable}}}` + content?.substring(end);
      onContentChange?.(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea?.focus();
        textarea?.setSelectionRange(start + variable?.length + 4, start + variable?.length + 4);
      }, 0);
    }
  };

  const commonVariables = [
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'program_name', label: 'Program Name' },
    { key: 'current_date', label: 'Current Date' },
    { key: 'jurisdiction', label: 'Jurisdiction' },
    { key: 'customer.email', label: 'Customer Email' },
    { key: 'customer.organization', label: 'Customer Organization' }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">NDA Editor</h2>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={onEdit}
              className="text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                loading={saving}
                className="text-sm"
              >
                Save Template
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-6">
        {/* Template Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e?.target?.value)}
            placeholder="Enter NDA title..."
            disabled={!isEditing}
            className="w-full"
          />
        </div>

        {/* Variable Inserter */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Variables
            </label>
            <div className="flex flex-wrap gap-2">
              {commonVariables?.map((variable) => (
                <button
                  key={variable?.key}
                  type="button"
                  onClick={() => insertVariable(variable?.key)}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {variable?.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NDA Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NDA Content
          </label>
          <textarea
            id="nda-content"
            value={content}
            onChange={(e) => onContentChange?.(e?.target?.value)}
            placeholder="Enter NDA content with variables like {{customer_name}}, {{company_name}}, etc."
            disabled={!isEditing}
            rows={20}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-sm ${
              isEditing 
                ? 'border-gray-300 bg-white' :'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Document Versioning Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Template Features</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Variables are automatically replaced when sent</li>
                  <li>Version history tracks all template changes</li>
                  <li>Templates can be shared across beta programs</li>
                  <li>Legal compliance validation available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Send for Signature Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send for Signature</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Customer
              </label>
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={customerOptions}
                placeholder="Choose a customer..."
                className="w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                NDA will be sent with electronic signature request
              </div>
              <Button
                onClick={handleSendForSignature}
                disabled={!selectedCustomer || !content?.trim()}
                className="text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send for Signature
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}