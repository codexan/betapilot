import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplateVersionHistory = ({ template, onRestoreVersion }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const versionHistory = [
    {
      id: 'v1.3',
      version: '1.3',
      timestamp: '2024-08-24 10:30:00',
      author: 'John Doe',
      changes: 'Updated subject line and added new variable placeholders',
      content: `Dear {{FirstName}},\n\nWe're excited to invite you to participate in our {{BetaName}} beta testing program.\n\nClick here to book your slot: {{SlotLink}}\n\nBest regards,\nThe Product Team`
    },
    {
      id: 'v1.2',version: '1.2',timestamp: '2024-08-23 15:45:00',author: 'Jane Smith',changes: 'Fixed formatting issues and improved readability',
      content: `Hi {{FirstName}},\n\nYou've been selected for {{BetaName}} beta testing.\n\nBook your slot: {{SlotLink}}\n\nThanks!`
    },
    {
      id: 'v1.1',
      version: '1.1',
      timestamp: '2024-08-22 09:15:00',
      author: 'John Doe',
      changes: 'Initial template creation with basic structure',
      content: `Hello {{FirstName}},\n\nWelcome to {{BetaName}} beta testing.\n\nSlot link: {{SlotLink}}`
    }
  ];

  const formatDate = (timestamp) => {
    return new Date(timestamp)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRestoreVersion = (version) => {
    onRestoreVersion(version);
    setShowHistory(false);
    setSelectedVersion(null);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        iconName="History"
        iconPosition="left"
        onClick={() => setShowHistory(true)}
      >
        Version History
      </Button>
      {/* Version History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Version History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 p-0"
                />
              </div>
            </div>
            
            <div className="flex h-[60vh]">
              {/* Version List */}
              <div className="w-1/3 border-r border-border overflow-y-auto">
                <div className="p-4 space-y-2">
                  {versionHistory?.map((version) => (
                    <div
                      key={version?.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`p-3 rounded-lg cursor-pointer transition-smooth border ${
                        selectedVersion?.id === version?.id
                          ? 'bg-primary/10 border-primary' :'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Version {version?.version}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(version?.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        by {version?.author}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {version?.changes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Preview */}
              <div className="flex-1 flex flex-col">
                {selectedVersion ? (
                  <>
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            Version {selectedVersion?.version}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedVersion?.timestamp)} by {selectedVersion?.author}
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          iconName="RotateCcw"
                          iconPosition="left"
                          onClick={() => handleRestoreVersion(selectedVersion)}
                        >
                          Restore Version
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedVersion?.changes}
                      </p>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="bg-background border border-border rounded-lg p-4">
                        <h5 className="text-sm font-medium text-foreground mb-3">Content Preview</h5>
                        <div className="text-sm text-foreground whitespace-pre-wrap">
                          {selectedVersion?.content}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="History" size={48} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Select a version to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateVersionHistory;