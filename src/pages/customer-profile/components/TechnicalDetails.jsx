import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TechnicalDetails = ({ technicalInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle mt-6">
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-foreground">Technical Details</h3>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Devices</h4>
            <div className="space-y-2">
              {technicalInfo?.devices?.map((device, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                  <Icon name="Smartphone" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{device?.name}</p>
                    <p className="text-xs text-muted-foreground">{device?.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Operating Systems</h4>
            <div className="flex flex-wrap gap-2">
              {technicalInfo?.operatingSystems?.map((os, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-md border border-secondary/20"
                >
                  {os}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Browsers</h4>
            <div className="flex flex-wrap gap-2">
              {technicalInfo?.browsers?.map((browser, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
                >
                  {browser}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Technical Expertise</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Experience Level:</span>
                <p className="text-foreground font-medium">{technicalInfo?.experienceLevel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Testing Experience:</span>
                <p className="text-foreground font-medium">{technicalInfo?.testingExperience}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalDetails;