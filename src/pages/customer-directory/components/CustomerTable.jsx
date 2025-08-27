import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const CustomerTable = ({ 
  customers, 
  selectedCustomers, 
  onSelectionChange, 
  sortConfig, 
  onSort,
  onBulkEmail,
  onEditCustomer 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(customers?.map(c => c?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectCustomer = (customerId, checked) => {
    if (checked) {
      onSelectionChange([...selectedCustomers, customerId]);
    } else {
      onSelectionChange(selectedCustomers?.filter(id => id !== customerId));
    }
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="opacity-50" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} />
      : <Icon name="ArrowDown" size={14} />;
  };

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

  const isAllSelected = customers?.length > 0 && selectedCustomers?.length === customers?.length;
  const isPartiallySelected = selectedCustomers?.length > 0 && selectedCustomers?.length < customers?.length;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Table Header Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox
              id="select-all-header"
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onChange={(e) => handleSelectAll(e?.target?.checked)}
              label={`${selectedCustomers?.length} selected`}
            />
            {selectedCustomers?.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Mail"
                  iconPosition="left"
                  onClick={() => onBulkEmail(selectedCustomers)}
                >
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export
                </Button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {customers?.length} customers
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <Checkbox
                  id="select-all-table"
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  label=""
                />
              </th>
              {[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'organization', label: 'Organization' },
                { key: 'jobTitle', label: 'Job Title' },
                { key: 'region', label: 'Region' },
                { key: 'participationStatus', label: 'Status' },
                { key: 'lastActivity', label: 'Last Activity' },
              ]?.map((column) => (
                <th
                  key={column?.key}
                  className="text-left p-4 font-medium text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => onSort(column?.key)}
                >
                  <div className="flex items-center gap-2">
                    {column?.label}
                    {getSortIcon(column?.key)}
                  </div>
                </th>
              ))}
              <th className="w-24 p-4 text-center font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr
                key={customer?.id}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  selectedCustomers?.includes(customer?.id) ? 'bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredRow(customer?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-4">
                  <Checkbox
                    id={`customer-${customer?.id}`}
                    checked={selectedCustomers?.includes(customer?.id)}
                    onChange={(e) => handleSelectCustomer(customer?.id, e?.target?.checked)}
                    label=""
                  />
                </td>
                <td className="p-4">
                  <Link
                    to="/customer-profile"
                    state={{ customerId: customer?.id }}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {customer?.first_name} {customer?.last_name}
                  </Link>
                </td>
                <td className="p-4 text-muted-foreground">{customer?.email}</td>
                <td className="p-4 text-muted-foreground">{customer?.organization}</td>
                <td className="p-4 text-muted-foreground">{customer?.jobTitle}</td>
                <td className="p-4 text-muted-foreground">{customer?.region}</td>
                <td className="p-4">{getStatusBadge(customer?.participationStatus)}</td>
                <td className="p-4 text-muted-foreground">{formatDate(customer?.lastActivity)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditCustomer(customer)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBulkEmail([customer?.id])}
                      title="Send email"
                    >
                      <Icon name="Mail" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or add your first customer to get started.
          </p>
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Add Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;