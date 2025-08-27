import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustIndicators = () => {
  const trustBadges = [
    {
      id: 1,
      icon: 'Shield',
      title: 'SSL Secured',
      description: 'Enterprise-grade encryption'
    },
    {
      id: 2,
      icon: 'Lock',
      title: 'SOC 2 Compliant',
      description: 'Audited security controls'
    },
    {
      id: 3,
      icon: 'CheckCircle',
      title: 'GDPR Ready',
      description: 'Data protection compliant'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <p className="text-center text-sm text-muted-foreground mb-4">
        Trusted by 500+ product teams worldwide
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trustBadges?.map((badge) => (
          <div key={badge?.id} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-2">
              <Icon name={badge?.icon} size={20} className="text-accent" />
            </div>
            <h4 className="text-xs font-medium text-foreground">{badge?.title}</h4>
            <p className="text-xs text-muted-foreground">{badge?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustIndicators;