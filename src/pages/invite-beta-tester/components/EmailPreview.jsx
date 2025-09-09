import React from 'react';

export function EmailPreview({ subject, content, customerName, programName }) {
  const previewContent = content || 'Email content will appear here...';
  const previewSubject = subject || 'Email subject will appear here...';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Email Preview</h2>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Email Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>From: no-reply@betapilot.com</span>
            <span>To: {customerName !== 'Customer Name' ? customerName : 'customer@example.com'}</span>
          </div>
        </div>

        {/* Email Subject */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-900">
            Subject: {previewSubject}
          </div>
        </div>

        {/* Email Body */}
        <div className="bg-white px-4 py-6">
          <div className="prose max-w-none">
            <div 
              className="text-gray-900 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: previewContent
                  .replace(/\n/g, '<br>')
                  .replace(/{{customer_name}}/g, `<span class="bg-yellow-100 px-1 rounded">${customerName}</span>`)
                  .replace(/{{program_name}}/g, `<span class="bg-yellow-100 px-1 rounded">${programName}</span>`)
                  .replace(/{{beta_program\.name}}/g, `<span class="bg-yellow-100 px-1 rounded">${programName}</span>`)
              }}
            />
          </div>

          {/* Default CTA Section */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-700 mb-3">
              This invitation will automatically include:
            </p>
            <ul className="text-sm text-indigo-600 space-y-1">
              <li>• Accept invitation button</li>
              <li>• NDA document for review and signature</li>
              <li>• Calendar booking link after NDA completion</li>
              <li>• Company branding and contact information</li>
            </ul>
          </div>
        </div>

        {/* Email Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>PilotBeta Inc. | support@pilotbeta.com</p>
            <p>You received this invitation because you were selected for our beta program.</p>
          </div>
        </div>
      </div>

      {/* Variable Helper */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>{`{{customer_name}}`} - Full name</div>
          <div>{`{{program_name}}`} - Beta program name</div>
          <div>{`{{customer.first_name}}`} - First name only</div>
          <div>{`{{customer.last_name}}`} - Last name only</div>
          <div>{`{{customer.email}}`} - Email address</div>
          <div>{`{{company_name}}`} - Your company name</div>
        </div>
      </div>
    </div>
  );
}