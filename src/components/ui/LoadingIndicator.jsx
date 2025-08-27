import React from 'react';
import Icon from '../AppIcon';

const LoadingIndicator = ({ 
  type = 'spinner', 
  size = 'default', 
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-muted rounded-md h-4 w-full mb-2"></div>
        <div className="bg-muted rounded-md h-4 w-3/4 mb-2"></div>
        <div className="bg-muted rounded-md h-4 w-1/2"></div>
      </div>
    );
  }

  if (type === 'progress') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        {text && (
          <span className={`text-muted-foreground ${textSizeClasses?.[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className={`animate-spin ${sizeClasses?.[size]}`}>
        <Icon name="Loader2" size={size === 'sm' ? 16 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24} />
      </div>
      {text && (
        <span className={`text-muted-foreground ${textSizeClasses?.[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator;