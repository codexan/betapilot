import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowList = ({ onCreateNew, onEditWorkflow }) => {
  const [workflows] = useState([
    {
      id: 1,
      name: 'New Beta Tester Onboarding',
      description: 'Automated welcome sequence for new beta testers including NDA reminders and getting started guide',
      trigger: 'Tester Invited',
      actions: 3,
      isActive: true,
      lastModified: '2024-08-20T10:30:00Z',
      executions: 47
    },
    {
      id: 2,
      name: 'Beta Campaign Launch Notification',
      description: 'Notify all eligible testers when a new beta campaign becomes available',
      trigger: 'New Beta Campaign Created',
      actions: 2,
      isActive: true,
      lastModified: '2024-08-18T14:15:00Z',
      executions: 12
    },
    {
      id: 3,
      name: 'NDA Completion Follow-up',
      description: 'Send thank you message and next steps after NDA is signed',
      trigger: 'NDA Signed',
      actions: 2,
      isActive: false,
      lastModified: '2024-08-15T09:45:00Z',
      executions: 23
    },
    {
      id: 4,
      name: 'Beta Testing Completion Survey',
      description: 'Collect feedback and testimonials from testers who complete beta testing',
      trigger: 'Beta Testing Completed',
      actions: 1,
      isActive: true,
      lastModified: '2024-08-22T16:20:00Z',
      executions: 8
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTriggerIcon = (trigger) => {
    const iconMap = {
      'Tester Invited': 'UserPlus',
      'New Beta Campaign Created': 'Rocket',
      'NDA Signed': 'FileCheck',
      'Beta Testing Completed': 'CheckCircle'
    };
    return iconMap?.[trigger] || 'Zap';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Existing Workflows</h2>
          <p className="text-muted-foreground">Manage your automated communication sequences</p>
        </div>
        <Button onClick={onCreateNew} iconName="Plus" iconPosition="left">
          Create New Workflow
        </Button>
      </div>
      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows?.map((workflow) => (
          <div key={workflow?.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-subtle transition-smooth">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{workflow?.name}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow?.isActive 
                      ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
                  }`}>
                    {workflow?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{workflow?.description}</p>
              </div>
            </div>

            {/* Trigger */}
            <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={getTriggerIcon(workflow?.trigger)} size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Trigger</p>
                <p className="text-xs text-muted-foreground">{workflow?.trigger}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{workflow?.actions}</p>
                <p className="text-xs text-muted-foreground">Actions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{workflow?.executions}</p>
                <p className="text-xs text-muted-foreground">Executions</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{formatDate(workflow?.lastModified)}</p>
                <p className="text-xs text-muted-foreground">Modified</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditWorkflow(workflow)}
                iconName="Edit"
                iconPosition="left"
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Copy"
              >
                Duplicate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="MoreVertical"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowList;