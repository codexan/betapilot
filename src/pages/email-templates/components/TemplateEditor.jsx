import React, { useState, useRef } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TemplateEditor = ({ template, onSave, onSendTest, onDuplicate }) => {
  const [templateData, setTemplateData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    category: template?.category || 'invitation',
    content: template?.content || ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);

  const variables = [
    { name: 'FirstName', description: 'Tester\'s first name' },
    { name: 'LastName', description: 'Tester\'s last name' },
    { name: 'BetaName', description: 'Beta testing campaign name' },
    { name: 'SlotLink', description: 'Beta testing slot booking link' },
    { name: 'CompanyName', description: 'Tester\'s company name' },
    { name: 'ExpiryDate', description: 'Beta testing expiry date' }
  ];

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

  const insertVariable = (variableName) => {
    const variable = `{{${variableName}}}`;
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) {
      const range = selection?.getRangeAt(0);
      range?.deleteContents();
      range?.insertNode(document.createTextNode(variable));
      range?.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    editorRef?.current?.focus();
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
    setIsSaving(true);
    try {
      await onSave(templateData);
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewContent = () => {
    return templateData?.content?.replace(/{{FirstName}}/g, 'John')?.replace(/{{LastName}}/g, 'Doe')?.replace(/{{BetaName}}/g, 'Mobile App Beta v2.1')?.replace(/{{SlotLink}}/g, 'https://betapilot.com/book-slot/abc123')?.replace(/{{CompanyName}}/g, 'TechCorp Inc.')?.replace(/{{ExpiryDate}}/g, '2024-09-15');
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
              onClick={() => onSendTest(templateData)}
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
            </select>
          </div>
        </div>
      </div>
      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Variables Panel */}
        <div className="w-64 bg-muted/30 border-r border-border p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-foreground mb-3">Variables</h3>
          <div className="space-y-2">
            {variables?.map(variable => (
              <button
                key={variable?.name}
                onClick={() => insertVariable(variable?.name)}
                className="w-full text-left p-2 rounded-md bg-background border border-border hover:bg-muted transition-smooth"
              >
                <div className="text-sm font-medium text-foreground">
                  {`{{${variable?.name}}}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {variable?.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {formatButtons?.map(button => (
                  <Button
                    key={button?.command}
                    variant="ghost"
                    size="sm"
                    iconName={button?.icon}
                    onClick={() => handleFormatClick(button?.command)}
                    className="w-8 h-8 p-0"
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
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: templateData?.content }}
                className="w-full h-full p-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground min-h-[400px] overflow-y-auto"
                style={{ whiteSpace: 'pre-wrap' }}
                placeholder="Start typing your email template..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;