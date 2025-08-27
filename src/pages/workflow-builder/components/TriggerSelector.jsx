import React from 'react';
import Icon from '../../../components/AppIcon';

const TriggerSelector = ({ selectedTrigger, onTriggerSelect }) => {
  const triggers = [
    {
      id: 'new-beta-campaign',
      name: 'New Beta Campaign Created',
      description: 'Automatically trigger when a new beta testing campaign is launched',
      icon: 'Rocket',
      category: 'Campaign Events'
    },
    {
      id: 'tester-invited',
      name: 'Tester Invited',
      description: 'Trigger when a new tester is invited to join a beta campaign',
      icon: 'UserPlus',
      category: 'Invitation Events'
    },
    {
      id: 'nda-signed',
      name: 'NDA Signed',
      description: 'Trigger when a tester completes the NDA signing process',
      icon: 'FileCheck',
      category: 'Legal Events'
    },
    {
      id: 'beta-completed',
      name: 'Beta Testing Completed',
      description: 'Trigger when a tester finishes their beta testing participation',
      icon: 'CheckCircle',
      category: 'Completion Events'
    }
  ];

  const groupedTriggers = triggers?.reduce((acc, trigger) => {
    if (!acc?.[trigger?.category]) {
      acc[trigger.category] = [];
    }
    acc?.[trigger?.category]?.push(trigger);
    return acc;
  }, {});

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Zap" size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Select Trigger</h3>
          <p className="text-sm text-muted-foreground">Choose what starts your workflow</p>
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(groupedTriggers)?.map(([category, categoryTriggers]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
            <div className="space-y-2">
              {categoryTriggers?.map((trigger) => (
                <div
                  key={trigger?.id}
                  onClick={() => onTriggerSelect(trigger)}
                  className={`p-4 rounded-lg border cursor-pointer transition-smooth hover:shadow-subtle ${
                    selectedTrigger?.id === trigger?.id
                      ? 'border-primary bg-primary/5 shadow-subtle'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTrigger?.id === trigger?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon name={trigger?.icon} size={20} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground mb-1">{trigger?.name}</h5>
                      <p className="text-sm text-muted-foreground">{trigger?.description}</p>
                    </div>
                    {selectedTrigger?.id === trigger?.id && (
                      <Icon name="Check" size={20} className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriggerSelector;