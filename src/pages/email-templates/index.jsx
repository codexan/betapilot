import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TemplateLibrary from './components/TemplateLibrary';
import TemplateEditor from './components/TemplateEditor';
import TemplateActions from './components/TemplateActions';
import TemplateVersionHistory from './components/TemplateVersionHistory';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  // Mock templates data
  const mockTemplates = [
    {
      id: 'tpl_001',
      name: 'Beta Invitation - Mobile App',
      subject: 'You\'re invited to test our new mobile app!',
      category: 'invitation',
      content: `Dear {{FirstName}},\n\nWe're excited to invite you to participate in the beta testing of our revolutionary mobile application, {{BetaName}}.\n\nAs a valued member of {{CompanyName}}, your feedback will be instrumental in shaping the final product.\n\n<strong>What you'll be testing:</strong>\n• New user interface design\n• Enhanced performance features\n• Advanced security protocols\n\n<strong>Next Steps:</strong>\n1. Click the link below to book your testing slot\n2. Complete the setup process\n3. Start testing and provide feedback\n\n<a href="{{SlotLink}}">Book Your Testing Slot</a>\n\nPlease note that this beta access expires on {{ExpiryDate}}.\n\nThank you for helping us build something amazing!\n\nBest regards,\nThe Product Team`,
      lastModified: '2 hours ago',
      usageCount: 45,
      createdAt: '2024-08-20',
      author: 'John Doe'
    },
    {
      id: 'tpl_002',
      name: 'Testing Reminder - Web Platform',
      subject: 'Reminder: Your beta testing slot expires soon',
      category: 'reminder',
      content: `Hi {{FirstName}},\n\nThis is a friendly reminder that your beta testing access for {{BetaName}} will expire in 3 days.\n\nIf you haven't started testing yet, please use the link below:\n{{SlotLink}}\n\nWe'd love to hear your feedback before the testing period ends on {{ExpiryDate}}.\n\nQuestions? Reply to this email and we'll help you out.\n\nThanks,\nBeta Testing Team`,
      lastModified: '1 day ago',usageCount: 23,createdAt: '2024-08-18',author: 'Jane Smith'
    },
    {
      id: 'tpl_003',name: 'Feedback Request - API Testing',subject: 'How was your {{BetaName}} testing experience?',category: 'feedback',
      content: `Hello {{FirstName}},\n\nThank you for participating in the {{BetaName}} beta testing program!\n\nYour testing session has concluded, and we'd love to hear about your experience.\n\n<strong>Please share your thoughts on:</strong>\n• Overall user experience\n• Performance and reliability\n• Feature completeness\n• Any bugs or issues encountered\n\n<a href="{{SlotLink}}">Submit Your Feedback</a>\n\nYour insights are invaluable in helping us improve the product before launch.\n\nAs a token of appreciation, you'll receive early access to the final release.\n\nThank you for your time and contribution!\n\nWarm regards,\nProduct Management Team`,
      lastModified: '3 days ago',usageCount: 67,createdAt: '2024-08-15',author: 'Mike Johnson'
    },
    {
      id: 'tpl_004',name: 'Beta Completion Certificate',subject: 'Congratulations! You\'ve completed {{BetaName}} beta testing',
      category: 'completion',
      content: `Congratulations {{FirstName}}!\n\nYou have successfully completed the beta testing program for {{BetaName}}.\n\n<strong>Your Contribution:</strong>\n• Testing duration: 2 weeks\n• Feedback submissions: 5\n• Bugs reported: 3\n• Feature suggestions: 2\n\nYour valuable feedback has directly contributed to improving the product quality.\n\n<strong>What's Next:</strong>\n• You'll receive early access to the production release\n• Exclusive beta tester badge on your profile\n• Priority consideration for future beta programs\n\nThank you for being an essential part of our development process!\n\nBest wishes,\nThe {{CompanyName}} Team`,
      lastModified: '5 days ago',
      usageCount: 12,
      createdAt: '2024-08-10',
      author: 'Sarah Wilson'
    }
  ];

  useEffect(() => {
    // Simulate loading templates
    const loadTemplates = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTemplates(mockTemplates);
      setIsLoading(false);
    };

    loadTemplates();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = async (templateData) => {
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (selectedTemplate) {
      // Update existing template
      const updatedTemplates = templates?.map(t => 
        t?.id === selectedTemplate?.id 
          ? { ...t, ...templateData, lastModified: 'Just now' }
          : t
      );
      setTemplates(updatedTemplates);
      setSelectedTemplate({ ...selectedTemplate, ...templateData });
      setShowSuccessMessage('Template updated successfully!');
    } else {
      // Create new template
      const newTemplate = {
        id: `tpl_${Date.now()}`,
        ...templateData,
        lastModified: 'Just now',
        usageCount: 0,
        createdAt: new Date()?.toISOString()?.split('T')?.[0],
        author: 'John Doe'
      };
      setTemplates([newTemplate, ...templates]);
      setSelectedTemplate(newTemplate);
      setShowSuccessMessage('Template created successfully!');
    }

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleSendTest = async (template, testEmail) => {
    // Simulate sending test email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowSuccessMessage(`Test email sent to ${testEmail}!`);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleDuplicateTemplate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: `tpl_${Date.now()}`,
      name: `${template?.name} (Copy)`,
      lastModified: 'Just now',
      usageCount: 0,
      createdAt: new Date()?.toISOString()?.split('T')?.[0]
    };
    setTemplates([duplicatedTemplate, ...templates]);
    setSelectedTemplate(duplicatedTemplate);
    setShowSuccessMessage('Template duplicated successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleDeleteTemplate = async (template) => {
    // Simulate delete operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedTemplates = templates?.filter(t => t?.id !== template?.id);
    setTemplates(updatedTemplates);
    
    if (selectedTemplate?.id === template?.id) {
      setSelectedTemplate(null);
    }
    
    setShowSuccessMessage('Template deleted successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleRestoreVersion = (version) => {
    if (selectedTemplate) {
      const restoredTemplate = {
        ...selectedTemplate,
        content: version?.content,
        lastModified: 'Just now'
      };
      
      const updatedTemplates = templates?.map(t => 
        t?.id === selectedTemplate?.id ? restoredTemplate : t
      );
      
      setTemplates(updatedTemplates);
      setSelectedTemplate(restoredTemplate);
      setShowSuccessMessage(`Restored to version ${version?.version}!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="px-6 py-4">
          <Breadcrumb />
          
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-success font-medium">{showSuccessMessage}</span>
            </div>
          )}
        </div>

        <div className="flex h-[calc(100vh-8rem)]">
          {/* Template Library Sidebar */}
          <div className="w-80 flex-shrink-0">
            <TemplateLibrary
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onCreateNew={handleCreateNew}
            />
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {selectedTemplate || templates?.length === 0 ? (
              <div className="flex-1 flex flex-col">
                {/* Template Actions */}
                {selectedTemplate && (
                  <div className="px-6 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <TemplateActions
                          template={selectedTemplate}
                          onSave={handleSaveTemplate}
                          onSendTest={handleSendTest}
                          onDuplicate={handleDuplicateTemplate}
                          onDelete={handleDeleteTemplate}
                        />
                      </div>
                      <TemplateVersionHistory
                        template={selectedTemplate}
                        onRestoreVersion={handleRestoreVersion}
                      />
                    </div>
                  </div>
                )}

                {/* Template Editor */}
                <div className="flex-1">
                  <TemplateEditor
                    template={selectedTemplate}
                    onSave={handleSaveTemplate}
                    onSendTest={handleSendTest}
                    onDuplicate={handleDuplicateTemplate}
                  />
                </div>
              </div>
            ) : (
              /* Empty State */
              (<div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Template to Edit
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a template from the sidebar to start editing, or create a new one to get started.
                  </p>
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={handleCreateNew}
                  >
                    Create New Template
                  </Button>
                </div>
              </div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;