import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TemplateActions = ({ template, onSave, onSendTest, onDuplicate, onDelete }) => {
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!testEmail) return;
    
    setIsSending(true);
    try {
      await onSendTest(template, testEmail);
      setShowTestModal(false);
      setTestEmail('');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(template);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Send"
          iconPosition="left"
          onClick={() => setShowTestModal(true)}
        >
          Send Test
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          iconName="Copy"
          iconPosition="left"
          onClick={() => onDuplicate(template)}
        >
          Duplicate
        </Button>

        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={() => {
            const dataStr = JSON.stringify(template, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = `${template?.name?.replace(/\s+/g, '_')}_template.json`;
            const linkElement = document.createElement('a');
            linkElement?.setAttribute('href', dataUri);
            linkElement?.setAttribute('download', exportFileDefaultName);
            linkElement?.click();
          }}
        >
          Export
        </Button>

        <Button
          variant="destructive"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete
        </Button>
      </div>
      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Send Test Email</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowTestModal(false)}
                  className="w-8 h-8 p-0"
                />
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Test Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e?.target?.value)}
                  required
                />
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    The test email will be sent with sample data for all variables.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  loading={isSending}
                  onClick={handleSendTest}
                  disabled={!testEmail}
                >
                  Send Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Delete Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-8 h-8 p-0"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={20} className="text-error" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Are you sure you want to delete "{template?.name}"?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. The template will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateActions;