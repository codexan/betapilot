import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = () => {
  const currentDate = new Date();
  const timeOfDay = currentDate?.getHours() < 12 ? 'morning' : currentDate?.getHours() < 18 ? 'afternoon' : 'evening';
  const formattedDate = currentDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Good {timeOfDay}, John! 👋
          </h1>
          <p className="text-muted-foreground">
            {formattedDate} • Here's what's happening with your beta programs today
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-md border border-border">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm text-foreground">3 active campaigns</span>
          </div>
          <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-md border border-border">
            <Icon name="Clock" size={16} className="text-accent" />
            <span className="text-sm text-foreground">2 pending reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;