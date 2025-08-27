import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: 'Invite New Testers',
      description: 'Add testers to your beta program',
      icon: 'UserPlus',
      action: () => navigate('/customer-directory'),
      variant: 'default'
    },
    {
      id: 2,
      title: 'Create Email Template',
      description: 'Design new communication templates',
      icon: 'Mail',
      action: () => navigate('/email-templates'),
      variant: 'outline'
    },
    {
      id: 3,
      title: 'Build Workflow',
      description: 'Automate your testing processes',
      icon: 'GitBranch',
      action: () => navigate('/workflow-builder'),
      variant: 'outline'
    },
    {
      id: 4,
      title: 'View All Customers',
      description: 'Manage your tester directory',
      icon: 'Users',
      action: () => navigate('/customer-directory'),
      variant: 'ghost'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: 'Review feedback from iOS Beta v2.1',
      dueDate: 'Today, 3:00 PM',
      priority: 'high'
    },
    {
      id: 2,
      task: 'Send reminder emails to inactive testers',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium'
    },
    {
      id: 3,
      task: 'Prepare weekly testing report',
      dueDate: 'Aug 26, 2025',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="space-y-3">
          {quickActions?.map((action) => (
            <div key={action?.id} className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-smooth">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Icon name={action?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{action?.title}</h3>
                  <p className="text-xs text-muted-foreground">{action?.description}</p>
                </div>
              </div>
              <Button
                variant={action?.variant}
                size="sm"
                onClick={action?.action}
                iconName="ArrowRight"
                iconPosition="right"
                iconSize={16}
              >
                Go
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming Tasks */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
          <Button variant="ghost" size="sm" iconName="Plus" iconPosition="left" iconSize={16}>
            Add Task
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingTasks?.map((task) => (
            <div key={task?.id} className="flex items-start space-x-3 p-3 border border-border rounded-md">
              <div className="flex items-center justify-center w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{task?.task}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{task?.dueDate}</span>
                  <span className={`text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                    {task?.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;