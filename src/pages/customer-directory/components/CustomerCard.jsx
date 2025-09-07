import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const CustomerCard = ({ 
  customer, 
  isSelected, 
  onSelectionChange, 
  onEditCustomer, 
  onBulkEmail 
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
      'Invited': { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
      'Completed': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
      'Declined': { bg: 'bg-error/10', text: 'text-error', dot: 'bg-error' },
    };

    const config = statusConfig?.[status] || statusConfig?.['Active'];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config?.dot}`} />
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-4 transition-all hover:shadow-subtle ${
      isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelectionChange(customer?.id, e?.target?.checked)}
            label=""
            error=""
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {customer?.first_name} {customer?.last_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{customer?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditCustomer(customer)}
            title="Edit customer"
          >
            <Icon name="Edit2" size={16} />
          </Button>
          <Link to="/customer-profile" state={{ customerId: customer?.id }}>
            <Button
              variant="ghost"
              size="sm"
              title="View profile"
            >
              <Icon name="Eye" size={16} />
            </Button>
          </Link>
          <Button disabled
            variant="ghost"
            size="sm"
            onClick={() => onBulkEmail([customer?.id])}
            title="Send email"
          >
            <Icon name="Mail" size={16} />
          </Button>
        </div>
      </div>
      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Organization</span>
          <span className="text-sm font-medium text-foreground">{customer?.organization}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Job Title</span>
          <span className="text-sm font-medium text-foreground">{customer?.jobTitle}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Region</span>
          <span className="text-sm font-medium text-foreground">{customer?.region}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {getStatusBadge(customer?.participationStatus)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Activity</span>
          <span className="text-sm font-medium text-foreground">{formatDate(customer?.lastActivity)}</span>
        </div>
      </div>
      {/* Segments */}
      {customer?.segments && customer?.segments?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {customer?.segments?.slice(0, 3)?.map((segment) => (
              <span
                key={segment}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
              >
                {segment}
              </span>
            ))}
            {customer?.segments?.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                +{customer?.segments?.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCard;