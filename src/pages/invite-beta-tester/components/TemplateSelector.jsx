import React from 'react';
import Select from '../../../components/ui/Select';

export function TemplateSelector({ templates, selectedTemplate, onTemplateChange }) {
  const templateOptions = templates?.map(template => ({
    value: template?.id,
    label: `${template?.name} ${template?.type ? `(${template?.type})` : ''}`,
    description: template?.description
  })) || [];

  const selectedTemplateData = templates?.find(t => t?.id === selectedTemplate);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Template</h2>
      <div className="space-y-4">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Template
          </label>
          <Select
            value={selectedTemplate}
            onChange={onTemplateChange}
            options={templateOptions}
            placeholder="Select an email template..."
            className="w-full"
          />
        </div>

        {/* Template Info */}
        {selectedTemplateData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedTemplateData?.name}
                </h3>
                {selectedTemplateData?.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedTemplateData?.description}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  {selectedTemplateData?.type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {selectedTemplateData?.type}
                    </span>
                  )}
                  <span>
                    Last updated: {selectedTemplateData?.updated_at ? new Date(selectedTemplateData.updated_at)?.toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => window.open('/email-templates', '_blank')}
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Manage Templates →
          </button>
          
          {templateOptions?.length === 0 && (
            <p className="text-sm text-gray-500">
              No templates found. Create templates first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}