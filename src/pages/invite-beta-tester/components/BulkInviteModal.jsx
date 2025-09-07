import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';


export function BulkInviteModal({ isOpen, onClose, betaPrograms, emailTemplates, onBulkInvite }) {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const programOptions = betaPrograms?.map(program => ({
    value: program?.id,
    label: program?.name
  })) || [];

  const templateOptions = emailTemplates?.map(template => ({
    value: template?.id,
    label: template?.name
  })) || [];

  const handleFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e?.target?.result;
        const lines = csv?.split('\n')?.filter(line => line?.trim());
        
        if (lines?.length > 0) {
          const headers = lines?.[0]?.split(',')?.map(header => header?.trim()?.replace(/"/g, ''));
          const rows = lines?.slice(1)?.map(line => {
            const values = line?.split(',')?.map(value => value?.trim()?.replace(/"/g, ''));
            const rowObj = {};
            headers?.forEach((header, index) => {
              rowObj[header] = values?.[index] || '';
            });
            return rowObj;
          });

          setCsvData(rows);
          setCsvPreview(rows?.slice(0, 5)); // Show first 5 rows as preview
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader?.readAsText(file);
  };

  const handleBulkInvite = async () => {
    if (!selectedProgram || !selectedTemplate || csvData?.length === 0) {
      alert('Please select program, template, and upload CSV data.');
      return;
    }

    try {
      setUploading(true);
      
      const invitations = csvData?.map(row => ({
        first_name: row?.first_name || row?.['First Name'] || '',
        last_name: row?.last_name || row?.['Last Name'] || '',
        email: row?.email || row?.Email || '',
        organization: row?.organization || row?.Organization || '',
        job_title: row?.job_title || row?.['Job Title'] || '',
        program_id: selectedProgram,
        template_id: selectedTemplate
      }));

      onBulkInvite?.(invitations);
      
    } catch (error) {
      console.error('Error creating bulk invites:', error);
      alert('Failed to create bulk invitations. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'first_name,last_name,email,organization,job_title\n"John","Doe","john.doe@example.com","Example Corp","Product Manager"\n"Jane","Smith","jane.smith@example.com","Tech Inc","Designer"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beta_tester_template.csv';
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Bulk Invite Beta Testers
              </h3>

              <div className="space-y-6">
                {/* Program Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beta Program *
                  </label>
                  <Select
                    value={selectedProgram}
                    onChange={setSelectedProgram}
                    options={programOptions}
                    placeholder="Select beta program..."
                    className="w-full"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Template *
                  </label>
                  <Select
                    value={selectedTemplate}
                    onChange={setSelectedTemplate}
                    options={templateOptions}
                    placeholder="Select email template..."
                    className="w-full"
                  />
                </div>

                {/* CSV Upload */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload CSV File *
                    </label>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Download Template
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    CSV should include: first_name, last_name, email, organization, job_title
                  </p>
                </div>

                {/* CSV Preview */}
                {csvPreview?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Preview ({csvData?.length} total records)
                    </label>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-700">
                          <div>First Name</div>
                          <div>Last Name</div>
                          <div>Email</div>
                          <div>Organization</div>
                          <div>Job Title</div>
                        </div>
                      </div>
                      <div className="bg-white max-h-40 overflow-y-auto">
                        {csvPreview?.map((row, index) => (
                          <div key={index} className="px-4 py-2 border-b border-gray-100 last:border-b-0">
                            <div className="grid grid-cols-5 gap-4 text-xs text-gray-900">
                              <div className="truncate">{row?.first_name || row?.['First Name'] || '-'}</div>
                              <div className="truncate">{row?.last_name || row?.['Last Name'] || '-'}</div>
                              <div className="truncate">{row?.email || row?.Email || '-'}</div>
                              <div className="truncate">{row?.organization || row?.Organization || '-'}</div>
                              <div className="truncate">{row?.job_title || row?.['Job Title'] || '-'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkInvite}
                  disabled={!selectedProgram || !selectedTemplate || csvData?.length === 0}
                  loading={uploading}
                >
                  Send {csvData?.length || 0} Invitations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}