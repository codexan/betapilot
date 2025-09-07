import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TemplateLibrary from './components/TemplateLibrary';
import TemplateEditor from './components/TemplateEditor';
import TemplateActions from './components/TemplateActions';
import TemplateVersionHistory from './components/TemplateVersionHistory';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import * as emailTemplateService from '../../services/emailTemplateService';

const EmailTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  // Load templates from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const { data, error: fetchError } = await emailTemplateService?.getEmailTemplates();
        
        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          setTemplates(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to load templates: ${err?.message || 'Unknown error'}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setError('');
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setError('');
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      setError('');
      let result;

      if (selectedTemplate?.id) {
        // Update existing template
        result = await emailTemplateService?.updateEmailTemplate(selectedTemplate?.id, templateData);
      } else {
        // Create new template
        result = await emailTemplateService?.createEmailTemplate(templateData);
      }

      if (result?.error) {
        throw result?.error;
      }

      // Update templates list
      const { data: refreshedTemplates } = await emailTemplateService?.getEmailTemplates();
      setTemplates(refreshedTemplates || []);

      // Update selected template
      if (result?.data) {
        setSelectedTemplate(result?.data);
      }

      setShowSuccessMessage(
        selectedTemplate?.id ? 'Template updated successfully!' : 'Template created successfully!'
      );
      
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to save template: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSendTest = async (template, testEmail) => {
    try {
      setError('');
      const { error: sendError } = await emailTemplateService?.sendTestEmail(template, testEmail);
      
      if (sendError) {
        throw sendError;
      }

      setShowSuccessMessage(`Test email sent to ${testEmail}!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to send test email: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      setError('');
      const { data, error: duplicateError } = await emailTemplateService?.duplicateEmailTemplate(template?.id);
      
      if (duplicateError) {
        throw duplicateError;
      }

      // Refresh templates list
      const { data: refreshedTemplates } = await emailTemplateService?.getEmailTemplates();
      setTemplates(refreshedTemplates || []);

      // Select the duplicated template
      if (data) {
        setSelectedTemplate(data);
      }

      setShowSuccessMessage('Template duplicated successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to duplicate template: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteTemplate = async (template) => {
    try {
      setError('');
      const { error: deleteError } = await emailTemplateService?.deleteEmailTemplate(template?.id);
      
      if (deleteError) {
        throw deleteError;
      }

      // Update templates list
      const updatedTemplates = templates?.filter(t => t?.id !== template?.id);
      setTemplates(updatedTemplates);
      
      // Clear selected template if it was deleted
      if (selectedTemplate?.id === template?.id) {
        setSelectedTemplate(null);
      }
      
      setShowSuccessMessage('Template deleted successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to delete template: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleRestoreVersion = async (version) => {
    if (!selectedTemplate?.id) return;

    try {
      setError('');
      const { data, error: updateError } = await emailTemplateService?.updateEmailTemplate(
        selectedTemplate?.id,
        {
          name: version?.name,
          subject: version?.subject,
          content: version?.content,
          variables: version?.variables,
          category: selectedTemplate?.category,
          is_active: selectedTemplate?.is_active
        }
      );
      
      if (updateError) {
        throw updateError;
      }

      // Update templates list and selected template
      const { data: refreshedTemplates } = await emailTemplateService?.getEmailTemplates();
      setTemplates(refreshedTemplates || []);
      
      if (data) {
        setSelectedTemplate(data);
      }

      setShowSuccessMessage(`Restored to version ${version?.version_number}!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to restore version: ${err?.message || 'Unknown error'}`);
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
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-destructive" />
              <span className="text-sm text-destructive font-medium">{error}</span>
            </div>
          )}

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