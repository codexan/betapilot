import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplateLibrary = ({ templates, selectedTemplate, onSelectTemplate, onCreateNew }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'invitation', label: 'Invitations' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'completion', label: 'Completion' }
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         template?.subject?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Templates</h2>
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
        <div className="relative mb-3">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e?.target?.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories?.map(category => (
            <option key={category?.value} value={category?.value}>
              {category?.label}
            </option>
          ))}
        </select>
      </div>
      {/* Template List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTemplates?.length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="FileText" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No templates found</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredTemplates?.map(template => (
              <div
                key={template?.id}
                onClick={() => onSelectTemplate(template)}
                className={`p-3 rounded-lg cursor-pointer transition-smooth border ${
                  selectedTemplate?.id === template?.id
                    ? 'bg-primary/10 border-primary' :'bg-background border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground truncate flex-1">
                    {template?.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template?.category === 'invitation' ? 'bg-blue-100 text-blue-700' :
                    template?.category === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                    template?.category === 'feedback' ? 'bg-green-100 text-green-700' :
                    template?.category === 'completion'? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {categories?.find(c => c?.value === template?.category)?.label || template?.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template?.subject}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Modified {template?.lastModified}</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="Eye" size={12} />
                    <span>{template?.usageCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;