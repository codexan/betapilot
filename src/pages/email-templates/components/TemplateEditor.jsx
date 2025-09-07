import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import * as emailTemplateService from '../../../services/emailTemplateService';

const TemplateEditor = ({ template, onSave, onSendTest, onDuplicate }) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    category: 'general',
    content: ''
  });
  const [variables, setVariables] = useState([]);
  const [filteredVariables, setFilteredVariables] = useState([]);
  const [variableSearch, setVariableSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showVariablesPanel, setShowVariablesPanel] = useState(true);
  const editorRef = useRef(null);

  // Load template variables and set initial data
  useEffect(() => {
    const loadVariables = async () => {
      try {
        const { data } = await emailTemplateService?.getTemplateVariables();
        const loadedVariables = data || [];
        
        // Fallback to default variables if service fails or returns empty
        const defaultVariables = [
          { name: 'FirstName', description: 'Customer first name', category: 'user_info', example_value: 'John' },
          { name: 'LastName', description: 'Customer last name', category: 'user_info', example_value: 'Doe' },
          { name: 'Email', description: 'Customer email address', category: 'user_info', example_value: 'john.doe@example.com' },
          { name: 'CompanyName', description: 'Customer company name', category: 'user_info', example_value: 'TechCorp Inc.' },
          { name: 'BetaName', description: 'Beta testing campaign name', category: 'campaign', example_value: 'Mobile App Beta v2.1' },
          { name: 'SlotLink', description: 'Beta testing slot booking link', category: 'campaign', example_value: 'https://betapilot.com/book-slot/abc123' },
          { name: 'ExpiryDate', description: 'Beta testing expiry date', category: 'campaign', example_value: '2024-09-15' },
          { name: 'FeedbackLink', description: 'Feedback submission link', category: 'campaign', example_value: 'https://betapilot.com/feedback/xyz789' },
          { name: 'SupportEmail', description: 'Support contact email', category: 'system', example_value: 'support@betapilot.com' }
        ];

        const finalVariables = loadedVariables?.length > 0 ? loadedVariables : defaultVariables;
        setVariables(finalVariables);
        setFilteredVariables(finalVariables);
      } catch (err) {
        // Use fallback variables
        const fallbackVariables = [
          { name: 'FirstName', description: 'Customer first name', category: 'user_info', example_value: 'John' },
          { name: 'LastName', description: 'Customer last name', category: 'user_info', example_value: 'Doe' },
          { name: 'Email', description: 'Customer email address', category: 'user_info', example_value: 'john.doe@example.com' },
          { name: 'CompanyName', description: 'Customer company name', category: 'user_info', example_value: 'TechCorp Inc.' },
          { name: 'BetaName', description: 'Beta testing campaign name', category: 'campaign', example_value: 'Mobile App Beta v2.1' },
          { name: 'SlotLink', description: 'Beta testing slot booking link', category: 'campaign', example_value: 'https://betapilot.com/book-slot/abc123' },
          { name: 'ExpiryDate', description: 'Beta testing expiry date', category: 'campaign', example_value: '2024-09-15' },
          { name: 'FeedbackLink', description: 'Feedback submission link', category: 'campaign', example_value: 'https://betapilot.com/feedback/xyz789' },
          { name: 'SupportEmail', description: 'Support contact email', category: 'system', example_value: 'support@betapilot.com' }
        ];
        setVariables(fallbackVariables);
        setFilteredVariables(fallbackVariables);
      }
    };

    loadVariables();
  }, []);

  // Filter variables based on search
  useEffect(() => {
    if (!variableSearch?.trim()) {
      setFilteredVariables(variables);
    } else {
      const filtered = variables?.filter(variable => 
        variable?.name?.toLowerCase()?.includes(variableSearch?.toLowerCase()) ||
        variable?.description?.toLowerCase()?.includes(variableSearch?.toLowerCase()) ||
        variable?.category?.toLowerCase()?.includes(variableSearch?.toLowerCase())
      );
      setFilteredVariables(filtered);
    }
  }, [variableSearch, variables]);

  // Update form when template changes
  useEffect(() => {
    if (template) {
      setTemplateData({
        name: template?.name || '',
        subject: template?.subject || '',
        category: template?.category || 'general',
        content: template?.content || ''
      });
    } else {
      setTemplateData({
        name: '',
        subject: '',
        category: 'general',
        content: ''
      });
    }
  }, [template]);

  const formatButtons = [
    { name: 'Bold', icon: 'Bold', command: 'bold' },
    { name: 'Italic', icon: 'Italic', command: 'italic' },
    { name: 'Underline', icon: 'Underline', command: 'underline' },
    { name: 'Link', icon: 'Link', command: 'createLink' },
    { name: 'Bullet List', icon: 'List', command: 'insertUnorderedList' },
    { name: 'Numbered List', icon: 'ListOrdered', command: 'insertOrderedList' }
  ];

  const handleInputChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormatClick = (command) => {
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, null);
    }
    editorRef?.current?.focus();
  };

  // Group variables by category
  const groupedVariables = filteredVariables?.reduce((groups, variable) => {
    const category = variable?.category || 'general';
    if (!groups?.[category]) {
      groups[category] = [];
    }
    groups?.[category]?.push(variable);
    return groups;
  }, {});

  const categoryLabels = {
    user_info: 'User Information',
    campaign: 'Campaign Details',
    system: 'System Variables',
    general: 'General'
  };

  const insertVariable = (variableName) => {
    const variable = `{{${variableName}}}`;
    
    if (editorRef?.current) {
      const editor = editorRef?.current;
      const selection = window.getSelection();
      
      if (selection?.rangeCount > 0 && editor?.contains(selection?.focusNode)) {
        const range = selection?.getRangeAt(0);
        range?.deleteContents();
        const textNode = document.createTextNode(variable);
        range?.insertNode(textNode);
        
        // Move cursor after inserted variable
        range?.setStartAfter(textNode);
        range?.setEndAfter(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // If no selection or cursor is not in editor, append to end
        editor.innerHTML += variable;
      }
      
      editor?.focus();
      handleContentChange();
    }
  };

  const handleContentChange = () => {
    if (editorRef?.current) {
      setTemplateData(prev => ({
        ...prev,
        content: editorRef?.current?.innerHTML
      }));
    }
  };

  const handleSave = async () => {
    if (!templateData?.name?.trim() || !templateData?.subject?.trim()) {
      alert('Please fill in both template name and subject');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(templateData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail?.trim()) {
      alert('Please enter a test email address');
      return;
    }

    if (!testEmail?.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await onSendTest(templateData, testEmail);
      setShowTestDialog(false);
      setTestEmail('');
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const getPreviewContent = () => {
    if (!templateData?.content) return '';
    
    return templateData?.content
      ?.replace(/{{FirstName}}/g, 'John')
      ?.replace(/{{LastName}}/g, 'Doe')
      ?.replace(/{{BetaName}}/g, 'Mobile App Beta v2.1')
      ?.replace(/{{SlotLink}}/g, '<a href="https://betapilot.com/book-slot/abc123">Book Your Testing Slot</a>')
      ?.replace(/{{CompanyName}}/g, 'TechCorp Inc.')
      ?.replace(/{{ExpiryDate}}/g, '2024-09-15')
      ?.replace(/{{FeedbackLink}}/g, '<a href="https://betapilot.com/feedback/xyz789">Submit Your Feedback</a>')
      ?.replace(/{{SupportEmail}}/g, 'support@betapilot.com');
  };

  return (
    <div className="bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {template ? 'Edit Template' : 'New Template'}
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Send"
              iconPosition="left"
              onClick={() => setShowTestDialog(true)}
            >
              Send Test
            </Button>
            {template && (
              <Button
                variant="outline"
                size="sm"
                iconName="Copy"
                iconPosition="left"
                onClick={() => onDuplicate(template)}
              >
                Duplicate
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              iconName="Save"
              iconPosition="left"
              loading={isSaving}
              onClick={handleSave}
            >
              Save Template
            </Button>
          </div>
        </div>

        {/* Template Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Template Name"
            type="text"
            placeholder="Enter template name"
            value={templateData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            required
          />
          <Input
            label="Subject Line"
            type="text"
            placeholder="Enter email subject"
            value={templateData?.subject}
            onChange={(e) => handleInputChange('subject', e?.target?.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={templateData?.category}
              onChange={(e) => handleInputChange('category', e?.target?.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="invitation">Invitation</option>
              <option value="reminder">Reminder</option>
              <option value="feedback">Feedback</option>
              <option value="completion">Completion</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>
      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Variables Panel */}
        {showVariablesPanel && (
          <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
            {/* Variables Panel Header */}
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center">
                  <Icon name="Code2" size={16} className="mr-2" />
                  Template Variables
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowVariablesPanel(false)}
                  className="w-6 h-6 p-0"
                />
              </div>
              
              {/* Variable Search */}
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={variableSearch}
                  onChange={(e) => setVariableSearch(e?.target?.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Click any variable to insert it into your template
              </p>
            </div>

            {/* Variables List */}
            <div className="flex-1 overflow-y-auto p-4">
              {Object?.entries(groupedVariables)?.map(([category, categoryVariables]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                    <Icon name="Folder" size={12} className="mr-1" />
                    {categoryLabels?.[category] || category}
                  </h4>
                  <div className="space-y-1">
                    {categoryVariables?.map(variable => (
                      <button
                        key={variable?.name}
                        onClick={() => insertVariable(variable?.name)}
                        className="w-full text-left p-3 rounded-lg bg-background border border-border hover:bg-muted hover:border-primary/50 transition-all duration-200 group"
                        title={`Click to insert {{${variable?.name}}}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-mono font-medium text-foreground group-hover:text-primary transition-colors">
                              {`{{${variable?.name}}}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {variable?.description}
                            </div>
                            {variable?.example_value && (
                              <div className="text-xs text-blue-600 mt-1 italic">
                                e.g., {variable?.example_value}
                              </div>
                            )}
                          </div>
                          <Icon name="Plus" size={14} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredVariables?.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Search" size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No variables found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!showVariablesPanel && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Code2"
                    iconPosition="left"
                    onClick={() => setShowVariablesPanel(true)}
                    className="mr-2"
                  >
                    Variables
                  </Button>
                )}
                {formatButtons?.map(button => (
                  <Button
                    key={button?.command}
                    variant="ghost"
                    size="sm"
                    iconName={button?.icon}
                    onClick={() => handleFormatClick(button?.command)}
                    className="w-8 h-8 p-0"
                    title={button?.name}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  iconName="Eye"
                  iconPosition="left"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">
            {showPreview ? (
              <div className="bg-background border border-border rounded-lg p-6 h-full overflow-y-auto">
                <div className="mb-4 pb-4 border-b border-border">
                  <h3 className="text-lg font-medium text-foreground mb-2">Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Subject:</strong> {templateData?.subject || 'No subject'}
                  </p>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleContentChange}
                  dangerouslySetInnerHTML={{ __html: templateData?.content }}
                  className="w-full h-full p-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground min-h-[400px] overflow-y-auto"
                  style={{ whiteSpace: 'pre-wrap' }}
                  placeholder="Start typing your email template..."
                />
                {!templateData?.content && (
                  <div className="absolute top-4 left-4 pointer-events-none text-muted-foreground text-sm">
                    Start typing your email template... Use the Variables panel to insert dynamic content.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Test Email Dialog */}
      {showTestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Send Test Email</h3>
            <Input
              label="Test Email Address"
              type="email"
              placeholder="Enter test email"
              value={testEmail}
              onChange={(e) => setTestEmail(e?.target?.value)}
              className="mb-4"
            />
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTestDialog(false);
                  setTestEmail('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSendTest}
              >
                Send Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;