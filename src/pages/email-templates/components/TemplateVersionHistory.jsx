import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import * as emailTemplateService from '../../../services/emailTemplateService';

const TemplateVersionHistory = ({ template, onRestoreVersion }) => {
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showHistory && template?.id) {
      loadVersionHistory();
    }
  }, [showHistory, template?.id]);

  const loadVersionHistory = async () => {
    if (!template?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await emailTemplateService?.getTemplateVersionHistory(template?.id);
      
      if (error) {
        console.error('Failed to load version history:', error);
        return;
      }

      setVersions(data || []);
    } catch (err) {
      console.error('Error loading version history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version) => {
    if (window.confirm(`Are you sure you want to restore to version ${version?.version_number}? This will overwrite the current content.`)) {
      onRestoreVersion(version);
      setShowHistory(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    const text = content?.replace(/<[^>]*>/g, ''); // Strip HTML tags
    return text?.length > maxLength ? `${text?.substring(0, maxLength)}...` : text;
  };

  if (!template?.id) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        iconName="History"
        iconPosition="left"
        onClick={() => setShowHistory(!showHistory)}
      >
        History
      </Button>

      {showHistory && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Version History</h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowHistory(false)}
                className="w-6 h-6 p-0"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Icon name="Loader2" size={20} className="mx-auto mb-2 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : versions?.length === 0 ? (
              <div className="p-4 text-center">
                <Icon name="History" size={24} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No version history available</p>
              </div>
            ) : (
              <div className="p-2">
                {versions?.map((version, index) => (
                  <div
                    key={version?.id}
                    className="p-3 mb-2 border border-border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                        }`} />
                        <span className="text-sm font-medium text-foreground">
                          Version {version?.version_number}
                          {index === 0 && <span className="text-xs text-primary ml-1">(Latest)</span>}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="RotateCcw"
                            onClick={() => handleRestore(version)}
                            className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
                          />
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(version?.created_at)}
                    </div>

                    <div className="text-xs">
                      <div className="font-medium text-foreground mb-1">
                        {version?.name}
                      </div>
                      <div className="text-muted-foreground mb-1">
                        Subject: {version?.subject}
                      </div>
                      <div className="text-muted-foreground">
                        {truncateContent(version?.content)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateVersionHistory;