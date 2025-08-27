import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkflowPreview = ({ selectedTrigger, selectedActions, workflowName }) => {
  const getActionIcon = (type) => {
    const iconMap = {
      'send-email': 'Mail',
      'update-status': 'RefreshCw',
      'add-tag': 'Tag',
      'create-task': 'CheckSquare'
    };
    return iconMap?.[type] || 'Settings';
  };

  const getActionLabel = (type) => {
    const labelMap = {
      'send-email': 'Send Email',
      'update-status': 'Update Status',
      'add-tag': 'Add Tag',
      'create-task': 'Create Task'
    };
    return labelMap?.[type] || type;
  };

  const formatDelay = (delay, unit) => {
    if (delay === 0) return 'Immediately';
    return `After ${delay} ${unit}`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
          <Icon name="Eye" size={18} className="text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Workflow Preview</h3>
          <p className="text-sm text-muted-foreground">Visual representation of your workflow</p>
        </div>
      </div>
      {!selectedTrigger && selectedActions?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Workflow" size={32} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Select a trigger and add actions to see your workflow</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Workflow Name */}
          {workflowName && (
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-foreground">{workflowName}</h4>
            </div>
          )}

          {/* Trigger */}
          {selectedTrigger && (
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-lg p-4 w-full max-w-xs text-center">
                <Icon name={selectedTrigger?.icon} size={24} className="mx-auto mb-2" />
                <p className="font-medium text-sm">{selectedTrigger?.name}</p>
              </div>
              {selectedActions?.length > 0 && (
                <div className="w-0.5 h-8 bg-border mt-4"></div>
              )}
            </div>
          )}

          {/* Actions */}
          {selectedActions?.map((action, index) => (
            <div key={action?.id} className="flex flex-col items-center">
              {/* Delay Indicator */}
              {action?.delay > 0 && (
                <>
                  <div className="bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-medium">
                    <Icon name="Clock" size={12} className="inline mr-1" />
                    {formatDelay(action?.delay, action?.delayUnit)}
                  </div>
                  <div className="w-0.5 h-4 bg-border mt-2"></div>
                </>
              )}

              {/* Action Node */}
              <div className="bg-accent text-accent-foreground rounded-lg p-4 w-full max-w-xs text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="w-6 h-6 bg-accent-foreground/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {action?.order}
                  </span>
                  <Icon name={getActionIcon(action?.type)} size={20} />
                </div>
                <p className="font-medium text-sm mb-1">{getActionLabel(action?.type)}</p>
                
                {/* Action Details */}
                {action?.type === 'send-email' && action?.template && (
                  <p className="text-xs opacity-80">
                    Template: {action?.template?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                  </p>
                )}
                {action?.recipients && action?.recipients !== 'all' && (
                  <p className="text-xs opacity-80">
                    To: {action?.recipients?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                  </p>
                )}
              </div>

              {/* Connection Line */}
              {index < selectedActions?.length - 1 && (
                <div className="w-0.5 h-8 bg-border mt-4"></div>
              )}
            </div>
          ))}

          {/* End Node */}
          {selectedActions?.length > 0 && (
            <div className="flex flex-col items-center mt-4">
              <div className="w-0.5 h-4 bg-border"></div>
              <div className="bg-success text-success-foreground rounded-full p-3">
                <Icon name="CheckCircle" size={20} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Workflow Complete</p>
            </div>
          )}
        </div>
      )}
      {/* Workflow Stats */}
      {(selectedTrigger || selectedActions?.length > 0) && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{selectedActions?.length}</p>
              <p className="text-xs text-muted-foreground">Actions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {selectedActions?.reduce((total, action) => total + (action?.delay || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Delay (min)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowPreview;