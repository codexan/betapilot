import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const TemplateLibrary = ({ templates, selectedTemplate, onSelectTemplate, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'invitation', label: 'Invitation' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'completion', label: 'Completion' },
    { value: 'general', label: 'General' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = !searchTerm || 
      template?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      template?.subject?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesCategory = !categoryFilter || template?.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      invitation: 'Mail',
      reminder: 'Clock',
      feedback: 'MessageSquare',
      completion: 'CheckCircle',
      general: 'FileText'
    };
    return categoryIcons?.[category] || 'FileText';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onCreateNew}
          >
            New
          </Button>
        </div>

        {/* Search */}
        <div className="mb-3">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="Filter by category"
          className="w-full"
        >
          {categories?.map(category => (
            <option key={category?.value} value={category?.value}>
              {category?.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTemplates?.length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="Search" size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || categoryFilter ? 'No templates match your filters' : 'No templates found'}
            </p>
            {!searchTerm && !categoryFilter && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                iconName="Plus"
                iconPosition="left"
                onClick={onCreateNew}
              >
                Create First Template
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredTemplates?.map(template => (
              <div
                key={template?.id}
                onClick={() => onSelectTemplate(template)}
                className={`p-3 mb-2 rounded-lg cursor-pointer border transition-all hover:bg-muted/50 ${
                  selectedTemplate?.id === template?.id
                    ? 'bg-primary/10 border-primary/30' :'bg-card border-border hover:border-border'
                }`}
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2 min-w-0 flex-1">
                    <Icon 
                      name={getCategoryIcon(template?.category)} 
                      size={16} 
                      className="text-muted-foreground mt-1 flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {template?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {template?.subject}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Status */}
                  <div className="flex-shrink-0">
                    {template?.is_active ? (
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Template Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">
                    {template?.category}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span>{formatDate(template?.updated_at || template?.created_at)}</span>
                    <span>{template?.usage_count || 0} uses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground text-center">
          {filteredTemplates?.length} of {templates?.length} templates
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;