import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ActionConfigurator = ({ selectedActions, onActionsChange }) => {
  const [newAction, setNewAction] = useState({
    type: '',
    template: '',
    delay: 0,
    delayUnit: 'minutes',
    recipients: 'all'
  });

  const emailTemplates = [
    { value: 'welcome-beta', label: 'Welcome to Beta Program' },
    { value: 'nda-reminder', label: 'NDA Signing Reminder' },
    { value: 'beta-invitation', label: 'Beta Testing Invitation' },
    { value: 'completion-survey', label: 'Beta Completion Survey' },
    { value: 'thank-you', label: 'Thank You Message' }
  ];

  const actionTypes = [
    { value: 'send-email', label: 'Send Email', icon: 'Mail' },
    { value: 'update-status', label: 'Update Status', icon: 'RefreshCw' },
    { value: 'add-tag', label: 'Add Tag', icon: 'Tag' },
    { value: 'create-task', label: 'Create Task', icon: 'CheckSquare' }
  ];

  const delayUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Testers' },
    { value: 'new', label: 'New Testers Only' },
    { value: 'active', label: 'Active Testers' },
    { value: 'specific', label: 'Specific Segment' }
  ];

  const handleAddAction = () => {
    if (newAction?.type) {
      const action = {
        id: Date.now(),
        ...newAction,
        order: selectedActions?.length + 1
      };
      onActionsChange([...selectedActions, action]);
      setNewAction({
        type: '',
        template: '',
        delay: 0,
        delayUnit: 'minutes',
        recipients: 'all'
      });
    }
  };

  const handleRemoveAction = (actionId) => {
    const updatedActions = selectedActions?.filter(action => action?.id !== actionId);
    onActionsChange(updatedActions);
  };

  const handleMoveAction = (actionId, direction) => {
    const currentIndex = selectedActions?.findIndex(action => action?.id === actionId);
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < selectedActions?.length - 1)
    ) {
      const newActions = [...selectedActions];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [newActions[currentIndex], newActions[targetIndex]] = [newActions?.[targetIndex], newActions?.[currentIndex]];
      
      // Update order numbers
      newActions?.forEach((action, index) => {
        action.order = index + 1;
      });
      
      onActionsChange(newActions);
    }
  };

  const getActionIcon = (type) => {
    const actionType = actionTypes?.find(at => at?.value === type);
    return actionType ? actionType?.icon : 'Settings';
  };

  const getActionLabel = (type) => {
    const actionType = actionTypes?.find(at => at?.value === type);
    return actionType ? actionType?.label : type;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="Settings" size={18} className="text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configure Actions</h3>
          <p className="text-sm text-muted-foreground">Define what happens when triggered</p>
        </div>
      </div>
      {/* Existing Actions */}
      {selectedActions?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Current Actions</h4>
          <div className="space-y-3">
            {selectedActions?.map((action, index) => (
              <div key={action?.id} className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {action?.order}
                    </div>
                    <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
                      <Icon name={getActionIcon(action?.type)} size={16} className="text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{getActionLabel(action?.type)}</p>
                      {action?.type === 'send-email' && action?.template && (
                        <p className="text-sm text-muted-foreground">
                          Template: {emailTemplates?.find(t => t?.value === action?.template)?.label}
                        </p>
                      )}
                      {action?.delay > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Delay: {action?.delay} {action?.delayUnit}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveAction(action?.id, 'up')}
                      disabled={index === 0}
                    >
                      <Icon name="ChevronUp" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveAction(action?.id, 'down')}
                      disabled={index === selectedActions?.length - 1}
                    >
                      <Icon name="ChevronDown" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(action?.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Add New Action */}
      <div className="border border-dashed border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">Add New Action</h4>
        
        <div className="space-y-4">
          <Select
            label="Action Type"
            options={actionTypes}
            value={newAction?.type}
            onChange={(value) => setNewAction({ ...newAction, type: value })}
            placeholder="Select action type"
          />

          {newAction?.type === 'send-email' && (
            <>
              <Select
                label="Email Template"
                options={emailTemplates}
                value={newAction?.template}
                onChange={(value) => setNewAction({ ...newAction, template: value })}
                placeholder="Select email template"
              />
              
              <Select
                label="Recipients"
                options={recipientOptions}
                value={newAction?.recipients}
                onChange={(value) => setNewAction({ ...newAction, recipients: value })}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Delay"
              type="number"
              value={newAction?.delay}
              onChange={(e) => setNewAction({ ...newAction, delay: parseInt(e?.target?.value) || 0 })}
              placeholder="0"
              min="0"
            />
            <Select
              label="Delay Unit"
              options={delayUnits}
              value={newAction?.delayUnit}
              onChange={(value) => setNewAction({ ...newAction, delayUnit: value })}
            />
          </div>

          <Button
            onClick={handleAddAction}
            disabled={!newAction?.type}
            iconName="Plus"
            iconPosition="left"
            className="w-full"
          >
            Add Action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfigurator;