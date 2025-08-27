import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: 'tester_response',
      title: 'New tester response received',
      description: 'Sarah Johnson completed the mobile app feedback survey',
      timestamp: '2 minutes ago',
      icon: 'MessageSquare',
      iconColor: 'text-success'
    },
    {
      id: 2,
      type: 'email_sent',
      title: 'Beta invitation emails sent',
      description: '25 invitations sent for iOS Beta v2.1 campaign',
      timestamp: '15 minutes ago',
      icon: 'Mail',
      iconColor: 'text-primary'
    },
    {
      id: 3,
      type: 'nda_signed',
      title: 'NDA signed',
      description: 'Michael Chen signed NDA for Enterprise Beta program',
      timestamp: '1 hour ago',
      icon: 'FileCheck',
      iconColor: 'text-accent'
    },
    {
      id: 4,
      type: 'workflow_triggered',
      title: 'Workflow automation triggered',
      description: 'Welcome email sequence started for 8 new testers',
      timestamp: '2 hours ago',
      icon: 'GitBranch',
      iconColor: 'text-secondary'
    },
    {
      id: 5,
      type: 'tester_joined',
      title: 'New tester registered',
      description: 'Emma Davis joined the Android Beta testing program',
      timestamp: '3 hours ago',
      icon: 'UserPlus',
      iconColor: 'text-success'
    },
    {
      id: 6,
      type: 'email_failed',
      title: 'Email delivery failed',
      description: '2 emails bounced - invalid addresses detected',
      timestamp: '4 hours ago',
      icon: 'AlertTriangle',
      iconColor: 'text-warning'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-smooth">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-smooth">
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full flex-shrink-0">
              <Icon name={activity?.icon} size={16} className={activity?.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity?.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{activity?.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{activity?.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;