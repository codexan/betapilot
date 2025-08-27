import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle,
  appliedFiltersCount 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const organizationOptions = [
    { value: '', label: 'All Organizations' },
    { value: 'google', label: 'Google Inc.' },
    { value: 'microsoft', label: 'Microsoft Corporation' },
    { value: 'apple', label: 'Apple Inc.' },
    { value: 'amazon', label: 'Amazon Web Services' },
    { value: 'meta', label: 'Meta Platforms' },
    { value: 'netflix', label: 'Netflix Inc.' },
    { value: 'uber', label: 'Uber Technologies' },
    { value: 'airbnb', label: 'Airbnb Inc.' },
  ];

  const regionOptions = [
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
  ];

  const segmentOptions = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'startup', label: 'Startup' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'executive', label: 'Executive' },
    { value: 'early-adopter', label: 'Early Adopter' },
    { value: 'power-user', label: 'Power User' },
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleParticipationStatusChange = (status, checked) => {
    const currentStatuses = localFilters?.participationStatus || [];
    const updatedStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses?.filter(s => s !== status);
    
    handleFilterChange('participationStatus', updatedStatuses);
  };

  const handleRegionChange = (regions) => {
    handleFilterChange('regions', regions);
  };

  const handleSegmentChange = (segments) => {
    handleFilterChange('segments', segments);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      organization: '',
      participationStatus: [],
      regions: [],
      segments: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const removeFilter = (filterType, value = null) => {
    const updatedFilters = { ...localFilters };
    
    if (filterType === 'search' || filterType === 'organization') {
      updatedFilters[filterType] = '';
    } else if (filterType === 'participationStatus') {
      updatedFilters.participationStatus = updatedFilters?.participationStatus?.filter(s => s !== value);
    } else if (filterType === 'regions') {
      updatedFilters.regions = updatedFilters?.regions?.filter(r => r !== value);
    } else if (filterType === 'segments') {
      updatedFilters.segments = updatedFilters?.segments?.filter(s => s !== value);
    }
    
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const getAppliedFilters = () => {
    const applied = [];
    
    if (localFilters?.search) {
      applied?.push({ type: 'search', label: `Search: "${localFilters?.search}"`, value: localFilters?.search });
    }
    
    if (localFilters?.organization) {
      const org = organizationOptions?.find(o => o?.value === localFilters?.organization);
      applied?.push({ type: 'organization', label: `Org: ${org?.label}`, value: localFilters?.organization });
    }
    
    (localFilters?.participationStatus || [])?.forEach(status => {
      applied?.push({ type: 'participationStatus', label: `Status: ${status}`, value: status });
    });
    
    (localFilters?.regions || [])?.forEach(region => {
      const regionLabel = regionOptions?.find(r => r?.value === region)?.label;
      applied?.push({ type: 'regions', label: `Region: ${regionLabel}`, value: region });
    });
    
    (localFilters?.segments || [])?.forEach(segment => {
      const segmentLabel = segmentOptions?.find(s => s?.value === segment)?.label;
      applied?.push({ type: 'segments', label: `Segment: ${segmentLabel}`, value: segment });
    });
    
    return applied;
  };

  const appliedFilters = getAppliedFilters();

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          iconName="Filter"
          iconPosition="left"
          className="w-full"
        >
          Filters {appliedFiltersCount > 0 && `(${appliedFiltersCount})`}
        </Button>
      </div>
      {/* Filter Sidebar */}
      <div className={`
        lg:block lg:relative lg:transform-none lg:bg-transparent lg:shadow-none
        ${isOpen ? 'block' : 'hidden'}
        fixed inset-0 z-50 lg:z-auto bg-background/80 backdrop-blur-sm lg:backdrop-blur-none
      `}>
        <div className={`
          lg:w-full lg:h-auto lg:relative lg:bg-transparent lg:shadow-none lg:rounded-none
          fixed right-0 top-0 h-full w-80 bg-card shadow-elevated rounded-l-lg lg:rounded-none
          overflow-y-auto
        `}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="p-4 lg:p-0 space-y-6">
            {/* Applied Filters */}
            {appliedFilters?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Applied Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {appliedFilters?.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                    >
                      <span>{filter?.label}</span>
                      <button
                        onClick={() => removeFilter(filter?.type, filter?.value)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="space-y-2">
              <Input
                type="search"
                placeholder="Search customers..."
                value={localFilters?.search || ''}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                className="w-full"
              />
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Select
                label="Organization"
                options={organizationOptions}
                value={localFilters?.organization || ''}
                onChange={(value) => handleFilterChange('organization', value)}
                placeholder="Select organization"
              />
            </div>

            {/* Participation Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Participation Status</h4>
              <div className="space-y-2">
                {['Active', 'Invited', 'Completed', 'Declined']?.map((status) => (
                  <Checkbox
                    key={status}
                    label={status}
                    checked={(localFilters?.participationStatus || [])?.includes(status)}
                    onChange={(e) => handleParticipationStatusChange(status, e?.target?.checked)}
                  />
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-2">
              <Select
                label="Regions"
                options={regionOptions}
                value={localFilters?.regions || []}
                onChange={handleRegionChange}
                multiple
                searchable
                placeholder="Select regions"
              />
            </div>

            {/* Segment Tags */}
            <div className="space-y-2">
              <Select
                label="Segment Tags"
                options={segmentOptions}
                value={localFilters?.segments || []}
                onChange={handleSegmentChange}
                multiple
                searchable
                placeholder="Select segments"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;