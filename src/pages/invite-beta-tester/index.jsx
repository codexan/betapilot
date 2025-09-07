import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import Button from '../../components/ui/Button';


import { InvitationForm } from './components/InvitationForm';
import { EmailPreview } from './components/EmailPreview';
import { TemplateSelector } from './components/TemplateSelector';
import { BulkInviteModal } from './components/BulkInviteModal';
import customerService from '../../services/customerService';
import emailTemplateService from '../../services/emailTemplateService';
import betaOnboardingService from '../../services/betaOnboardingService';

export default function InviteBetaTester() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [betaPrograms, setBetaPrograms] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sendTiming, setSendTiming] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Template and preview state
  const [emailPreview, setEmailPreview] = useState({
    subject: '',
    content: '',
    variables: {}
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadInitialData();
    }
  }, [user, authLoading, navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [customersData, programsData, templatesData] = await Promise.all([
        customerService?.getCustomers(),
        customerService?.getBetaPrograms(), // Assuming this method exists
        emailTemplateService?.getTemplates()
      ]);

      setCustomers(customersData || []);
      setBetaPrograms(programsData || []);
      setEmailTemplates(templatesData || []);

      // Set default template if available
      if (templatesData?.length > 0) {
        const inviteTemplate = templatesData?.find(t => 
          t?.type === 'invitation' || t?.name?.toLowerCase()?.includes('invite')
        ) || templatesData?.[0];
        
        setSelectedTemplate(inviteTemplate?.id);
        updateEmailPreview(inviteTemplate);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmailPreview = async (template, customerData = null, programData = null) => {
    if (!template) return;

    try {
      // Get template variables
      const variables = await betaOnboardingService?.getTemplateVariables(template?.id);
      const variableMap = {};
      
      variables?.forEach(variable => {
        variableMap[variable.variable_name] = variable?.variable_value;
      });

      // Replace variables with actual data if available
      const customer = customerData || customers?.find(c => c?.id === selectedCustomer);
      const program = programData || betaPrograms?.find(p => p?.id === selectedProgram);

      let processedSubject = customSubject || template?.subject || '';
      let processedContent = customMessage || template?.content || '';

      // Replace common variables
      if (customer) {
        processedSubject = processedSubject?.replace(/{{customer_name}}/g, `${customer?.first_name} ${customer?.last_name}`);
        processedContent = processedContent?.replace(/{{customer_name}}/g, `${customer?.first_name} ${customer?.last_name}`);
        processedContent = processedContent?.replace(/{{customer\.first_name}}/g, customer?.first_name);
        processedContent = processedContent?.replace(/{{customer\.last_name}}/g, customer?.last_name);
        processedContent = processedContent?.replace(/{{customer\.email}}/g, customer?.email);
      }

      if (program) {
        processedSubject = processedSubject?.replace(/{{program_name}}/g, program?.name);
        processedContent = processedContent?.replace(/{{program_name}}/g, program?.name);
        processedContent = processedContent?.replace(/{{beta_program\.name}}/g, program?.name);
      }

      // Apply custom variables
      Object.entries(variableMap)?.forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedSubject = processedSubject?.replace(regex, value);
        processedContent = processedContent?.replace(regex, value);
      });

      setEmailPreview({
        subject: processedSubject,
        content: processedContent,
        variables: variableMap
      });

    } catch (error) {
      console.error('Error updating email preview:', error);
    }
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    const customer = customers?.find(c => c?.id === customerId);
    const template = emailTemplates?.find(t => t?.id === selectedTemplate);
    const program = betaPrograms?.find(p => p?.id === selectedProgram);
    
    if (template) {
      updateEmailPreview(template, customer, program);
    }
  };

  const handleProgramChange = (programId) => {
    setSelectedProgram(programId);
    const program = betaPrograms?.find(p => p?.id === programId);
    const template = emailTemplates?.find(t => t?.id === selectedTemplate);
    const customer = customers?.find(c => c?.id === selectedCustomer);
    
    if (template) {
      updateEmailPreview(template, customer, program);
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates?.find(t => t?.id === templateId);
    
    if (template) {
      setCustomSubject(template?.subject || '');
      setCustomMessage(template?.content || '');
      updateEmailPreview(template);
    }
  };

  const handleSendInvitation = async (saveAsDraft = false) => {
    if (!selectedCustomer || !selectedProgram) {
      alert('Please select both a customer and beta program.');
      return;
    }

    try {
      setSaving(true);

      const invitationData = {
        customer_id: selectedCustomer,
        beta_program_id: selectedProgram,
        email_subject: emailPreview?.subject,
        email_content: emailPreview?.content
      };

      const invitationId = await betaOnboardingService?.createInvitation(invitationData);

      if (!saveAsDraft && sendTiming === 'immediate') {
        await betaOnboardingService?.updateInvitationStatus(invitationId, 'sent');
      }

      // Reset form
      setSelectedCustomer('');
      setSelectedProgram('');
      setCustomSubject('');
      setCustomMessage('');
      
      alert(saveAsDraft ? 'Invitation saved as draft!' : 'Invitation sent successfully!');
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invite Beta Tester</h1>
              <p className="mt-2 text-gray-600">Send customizable invitations to onboard new beta testers</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkModal(true)}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Invite
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/customer-directory')}
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form (5 columns) */}
          <div className="lg:col-span-5">
            <InvitationForm
              customers={customers}
              betaPrograms={betaPrograms}
              selectedCustomer={selectedCustomer}
              selectedProgram={selectedProgram}
              onCustomerChange={handleCustomerChange}
              onProgramChange={handleProgramChange}
              customSubject={customSubject}
              customMessage={customMessage}
              onSubjectChange={setCustomSubject}
              onMessageChange={setCustomMessage}
              sendTiming={sendTiming}
              scheduledDate={scheduledDate}
              onSendTimingChange={setSendTiming}
              onScheduledDateChange={setScheduledDate}
            />
          </div>

          {/* Right Column - Preview (7 columns) */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {/* Template Selector */}
              <TemplateSelector
                templates={emailTemplates}
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />

              {/* Email Preview */}
              <EmailPreview
                subject={emailPreview?.subject}
                content={emailPreview?.content}
                customerName={
                  selectedCustomer 
                    ? `${customers?.find(c => c?.id === selectedCustomer)?.first_name} ${customers?.find(c => c?.id === selectedCustomer)?.last_name}`
                    : 'Customer Name'
                }
                programName={
                  selectedProgram 
                    ? betaPrograms?.find(p => p?.id === selectedProgram)?.name
                    : 'Beta Program Name'
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => handleSendInvitation(true)}
            disabled={saving}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSendInvitation(false)}
            disabled={saving || !selectedCustomer || !selectedProgram}
            loading={saving}
          >
            Send Invitation
          </Button>
        </div>
      </div>
      {/* Bulk Invite Modal */}
      {showBulkModal && (
        <BulkInviteModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          betaPrograms={betaPrograms}
          emailTemplates={emailTemplates}
          onBulkInvite={(invitations) => {
            console.log('Bulk invitations:', invitations);
            setShowBulkModal(false);
          }}
        />
      )}
    </div>
  );
}