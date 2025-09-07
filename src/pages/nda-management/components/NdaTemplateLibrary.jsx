import React from 'react';
import Button from '../../../components/ui/Button';

export function NdaTemplateLibrary({ templates, selectedTemplate, onTemplateSelect }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Library</h2>
      <div className="space-y-3">
        {templates?.map((template) => (
          <div
            key={template?.id}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              selectedTemplate?.id === template?.id
                ? 'border-indigo-500 bg-indigo-50' :'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect?.(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {template?.name}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template?.type === 'Standard' ?'bg-blue-100 text-blue-800'
                      : template?.type === 'Enterprise' ?'bg-purple-100 text-purple-800' 
                      : template?.type === 'Basic' ?'bg-green-100 text-green-800' :'bg-orange-100 text-orange-800'
                  }`}>
                    {template?.type}
                  </span>
                </div>
              </div>
              {selectedTemplate?.id === template?.id && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-500 line-clamp-2">
                {template?.content?.substring(0, 100)}...
              </p>
            </div>
          </div>
        ))}

        {templates?.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first NDA template</p>
          </div>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => onTemplateSelect?.({
            id: `new-${Date.now()}`,
            name: 'New Template',
            type: 'Custom',
            content: 'Enter your NDA content here...'
          })}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Template
        </Button>
      </div>
    </div>
  );
}