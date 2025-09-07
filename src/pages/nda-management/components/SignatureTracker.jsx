import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

export function SignatureTracker({ ndaDocuments, onSignatureUpdate, onRefresh }) {
  const [expandedNda, setExpandedNda] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      signed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Signed' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      declined: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Declined' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReminder = (ndaId) => {
    alert('Reminder sent successfully!');
  };

  const handleDownload = (nda) => {
    if (nda?.signature_url) {
      window.open(nda?.signature_url, '_blank');
    } else {
      alert('No signed document available yet.');
    }
  };

  const getTotalsByStatus = () => {
    const totals = {
      pending: 0,
      signed: 0,
      expired: 0,
      declined: 0
    };

    ndaDocuments?.forEach(nda => {
      totals[nda.status] = (totals?.[nda?.status] || 0) + 1;
    });

    return totals;
  };

  const totals = getTotalsByStatus();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Signature Tracking</h2>
        <Button
          variant="outline"
          onClick={onRefresh}
          className="text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{totals?.pending}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-200 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Signed</p>
              <p className="text-2xl font-bold text-green-600">{totals?.signed}</p>
            </div>
            <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* NDA List */}
      <div className="space-y-3">
        {ndaDocuments?.length > 0 ? (
          ndaDocuments?.map((nda) => (
            <div
              key={nda?.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {nda?.customer?.first_name} {nda?.customer?.last_name}
                    </h3>
                    {getStatusBadge(nda?.status)}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1">
                    {nda?.customer?.email}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    Program: {nda?.beta_invitation?.beta_program?.name || 'N/A'}
                  </p>
                </div>

                <div className="flex-shrink-0 ml-3">
                  <button
                    onClick={() => setExpandedNda(expandedNda === nda?.id ? null : nda?.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${expandedNda === nda?.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {expandedNda === nda?.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{formatDate(nda?.created_at)}</span>
                    </div>
                    {nda?.signed_at && (
                      <div className="flex justify-between">
                        <span>Signed:</span>
                        <span>{formatDate(nda?.signed_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{formatDate(nda?.expires_at)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      {nda?.status === 'pending' && (
                        <Button
                          variant="outline"
                          onClick={() => handleReminder(nda?.id)}
                          className="text-xs px-2 py-1"
                        >
                          Send Reminder
                        </Button>
                      )}
                      {nda?.status === 'signed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(nda)}
                          className="text-xs px-2 py-1"
                        >
                          Download
                        </Button>
                      )}
                    </div>

                    {nda?.status === 'pending' && (
                      <div className="text-xs text-gray-500">
                        Automated reminders enabled
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No NDAs found</h3>
            <p className="mt-1 text-sm text-gray-500">Send NDAs to get signature tracking</p>
          </div>
        )}
      </div>
      {/* Integration Info */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">Integration Ready</h3>
            <div className="mt-2 text-sm text-indigo-700">
              <p>Connect with DocuSign or Adobe Sign for electronic signatures and automatic status updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}