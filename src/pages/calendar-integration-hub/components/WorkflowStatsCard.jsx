import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const WorkflowStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend = null, 
  trendDirection = 'up',
  className = '' 
}) => {
  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return <Minus className="w-4 h-4 text-gray-500" />;
    
    if (trend?.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend?.startsWith('-')) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend || trend === 'stable') return 'text-gray-500';
    
    if (trend?.startsWith('+')) {
      return 'text-green-600';
    } else if (trend?.startsWith('-')) {
      return 'text-red-600';
    } else {
      return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <div className="ml-2 flex items-center text-sm">
                {getTrendIcon()}
                <span className={`ml-1 ${getTrendColor()}`}>
                  {trend}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {trend && trend !== 'stable' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Compared to last period
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatsCard;