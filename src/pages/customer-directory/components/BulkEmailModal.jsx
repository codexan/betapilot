import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BulkEmailModal = ({ isOpen, onClose, selectedCustomers, customers }) => {
  const [emailData, setEmailData] = useState({
    template: '',
    subject: '',
    customMessage: '',
    sendFrom: 'john.doe@company.com'
  });

  const [isLoading, setIsLoading] = useState(false);

  const templateOptions = [
    { value: '', label: 'Select a template' },
    { value: 'beta-invitation', label: 'Beta Invitation' },
    { value: 'welcome-onboard', label: 'Welcome & Onboarding' },
    { value: 'feedback-request', label: 'Feedback Request' },
    { value: 'beta-completion', label: 'Beta Completion' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'custom', label: 'Custom Message' },
  ];

  const getSelectedCustomerDetails = () => {
    return customers?.filter(customer => selectedCustomers?.includes(customer?.id));
  };

  const handleInputChange = (field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmails = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call for sending emails
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Sending emails to:', selectedCustomers);
      console.log('Email data:', emailData);
      
      // Show success message or handle response
      onClose();
    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewText = () => {
    const templates = {
      'beta-invitation': `Hi {{FirstName}},\n\nWe're excited to invite you to participate in our upcoming beta program for {{BetaName}}. Your expertise and feedback would be invaluable to us.\n\nClick here to join: {{SlotLink}}\n\nBest regards,\nThe Product Team`,
      'welcome-onboard': `Welcome {{FirstName}}!\n\nThank you for joining our beta program. We're thrilled to have you on board.\n\nHere's what you need to know to get started...\n\nBest regards,\nThe Product Team`,
      'feedback-request': `Hi {{FirstName}},\n\nWe hope you're enjoying the beta experience so far. We'd love to hear your thoughts and feedback.\n\nPlease share your insights here: {{FeedbackLink}}\n\nThank you for your time!\nThe Product Team`,
      'beta-completion': `Hi {{FirstName}},\n\nThank you for participating in our beta program. Your feedback has been incredibly valuable.\n\nWe'll keep you updated on the official launch.\n\nBest regards,\nThe Product Team`,
      'follow-up': `Hi {{FirstName}},\n\nWe wanted to follow up on your beta experience and see if you have any additional feedback.\n\nFeel free to reach out if you have any questions.\n\nBest regards,\nThe Product Team`
    };

    return templates?.[emailData?.template] || emailData?.customMessage || 'Select a template to see preview...';
  };

  if (!isOpen) return null;

  const selectedCustomerDetails = getSelectedCustomerDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Send Bulk Email</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sending to {selectedCustomers?.length} customer{selectedCustomers?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Email Composition */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto border-r border-border">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Email Details</h3>
              
              <Input
                label="From"
                type="email"
                value={emailData?.sendFrom}
                onChange={(e) => handleInputChange('sendFrom', e?.target?.value)}
                description="Emails will be sent from your authenticated account"
                disabled
              />

              <Select
                label="Email Template"
                options={templateOptions}
                value={emailData?.template}
                onChange={(value) => handleInputChange('template', value)}
                placeholder="Choose a template"
              />

              <Input
                label="Subject Line"
                type="text"
                value={emailData?.subject}
                onChange={(e) => handleInputChange('subject', e?.target?.value)}
                placeholder="Enter email subject"
                description="You can use variables like {{FirstName}} and {{BetaName}}"
              />

              {emailData?.template === 'custom' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Custom Message
                  </label>
                  <textarea
                    value={emailData?.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e?.target?.value)}
                    placeholder="Write your custom message here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {{FirstName}}, {{LastName}}, {{Organization}}, {{BetaName}}, {{SlotLink}}
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Preview</h3>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">From:</span> {emailData?.sendFrom}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Subject:</span> {emailData?.subject || 'No subject'}
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {getPreviewText()}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Recipients */}
          <div className="w-80 p-6 bg-muted/30 overflow-y-auto">
            <h3 className="text-lg font-medium text-foreground mb-4">
              Recipients ({selectedCustomers?.length})
            </h3>
            
            <div className="space-y-3">
              {selectedCustomerDetails?.map((customer) => (
                <div key={customer?.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {customer?.firstName} {customer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {customer?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer?.organization}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCustomers?.length > 10 && (
              <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning" />
                  <p className="text-xs text-warning font-medium">
                    Large recipient list
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Emails will be sent individually to avoid spam filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Emails will be sent individually with personalization</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmails}
              loading={isLoading}
              iconName="Send"
              iconPosition="left"
              disabled={!emailData?.template || !emailData?.subject}
            >
              Send {selectedCustomers?.length} Email{selectedCustomers?.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmailModal;