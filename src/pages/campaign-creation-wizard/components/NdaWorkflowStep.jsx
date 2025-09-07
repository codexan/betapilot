import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';
import AppIcon from '../../../components/AppIcon';

const NdaWorkflowStep = ({ data, updateData, onSendNow, campaignState, loading, selectedTesters = [] }) => {
  const [ndaStats, setNdaStats] = useState({
    sent: 0,
    signed: 0,
    pending: 0
  });

  // Default NDA template
  const defaultNdaTemplate = `BETA PROGRAM NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{date}} by and between {{company_name}} ("Company") and {{customer_name}} ("Participant").

1. CONFIDENTIAL INFORMATION
Participant acknowledges that during the course of the beta testing program, Participant may have access to certain confidential and proprietary information of Company, including but not limited to:
- Software features and functionality
- Product roadmaps and development plans
- Technical specifications and documentation
- User interface designs and workflows
- Performance metrics and analytics

2. NON-DISCLOSURE OBLIGATIONS
Participant agrees to:
a) Hold all Confidential Information in strict confidence
b) Not disclose any Confidential Information to third parties
c) Use Confidential Information solely for the purpose of beta testing
d) Return or destroy all Confidential Information upon request

3. TERM
This Agreement shall remain in effect for 2 years from the date of signing or until the information becomes publicly available through no breach of this Agreement.

4. REMEDIES
Participant acknowledges that any breach of this Agreement may cause irreparable harm to Company.

By signing below, Participant agrees to be bound by the terms of this Agreement.

Signature: ______________________
Print Name: {{customer_name}}
Date: {{date}}`;

  // Initialize NDA template if not set
  useEffect(() => {
    if (!data?.ndaTemplate) {
      updateData({
        ndaTemplate: defaultNdaTemplate,
        ndaTitle: 'Beta Program Non-Disclosure Agreement',
        ndaEnabled: true
      });
    }
  }, []);

  // Calculate NDA statistics
  useEffect(() => {
    if (selectedTesters?.length > 0) {
      setNdaStats({
        sent: 0, // Would come from actual data
        signed: 0, // Would come from actual data
        pending: selectedTesters?.length
      });
    }
  }, [selectedTesters]);

  // Handle NDA template change
  const handleTemplateChange = (content) => {
    updateData({ ndaTemplate: content });
  };

  // Handle NDA title change
  const handleTitleChange = (title) => {
    updateData({ ndaTitle: title });
  };

  // Handle NDA enable/disable
  const handleNdaToggle = (enabled) => {
    updateData({ ndaEnabled: enabled });
  };

  // Predefined NDA templates
  const ndaTemplates = [
    {
      id: 'standard',
      name: 'Standard Beta NDA',
      content: defaultNdaTemplate
    },
    {
      id: 'short',
      name: 'Short Form NDA',
      content: `BETA TESTING CONFIDENTIALITY AGREEMENT

I, {{customer_name}}, agree to keep confidential all information related to {{company_name}}'s beta program, including software features, bugs, and feedback discussions.

This agreement is effective for 1 year from {{date}}.

Signature: ______________________
Date: {{date}}`
    },
    {
      id: 'enterprise',
      name: 'Enterprise NDA',
      content: `ENTERPRISE BETA NON-DISCLOSURE AGREEMENT

This comprehensive agreement governs the confidential relationship between {{company_name}} and {{customer_name}} for enterprise beta testing.

CONFIDENTIALITY SCOPE:
- All software features and functionality
- Integration capabilities and APIs
- Security implementations
- Performance benchmarks
- Commercial terms and pricing

OBLIGATIONS:
- Maintain strict confidentiality
- Implement appropriate security measures
- Limit access to authorized personnel only
- Provide regular feedback under confidentiality

TERM: 3 years from execution date.

Authorized Signature: ______________________
Title: ______________________
Date: {{date}}`
    }
  ];

  // Handle template selection
  const handleTemplateSelection = (templateId) => {
    const template = ndaTemplates?.find(t => t?.id === templateId);
    if (template) {
      updateData({ ndaTemplate: template?.content });
    }
  };

  return (
    <div className="space-y-8">
      {/* NDA Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NDA Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">NDA Configuration</h3>
            
            {/* NDA Enable/Disable */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="nda-enabled"
                  label="Require NDA for Beta Access"
                  checked={data?.ndaEnabled ?? true}
                  onChange={(checked) => handleNdaToggle(checked)}
                  error=""
                />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Testers must sign NDA before accessing beta features
                  </p>
                </div>
              </div>

              {data?.ndaEnabled && (
                <>
                  {/* NDA Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      NDA Title
                    </label>
                    <input
                      type="text"
                      value={data?.ndaTitle || ''}
                      onChange={(e) => handleTitleChange(e?.target?.value)}
                      placeholder="Enter NDA title"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      NDA Template
                    </label>
                    <div className="space-y-2">
                      {ndaTemplates?.map((template) => (
                        <div key={template?.id} className="flex items-start space-x-2">
                          <input
                            type="radio"
                            id={template?.id}
                            name="ndaTemplate"
                            className="mt-1 text-primary focus:ring-primary"
                            onChange={() => handleTemplateSelection(template?.id)}
                          />
                          <div>
                            <label 
                              htmlFor={template?.id} 
                              className="text-sm font-medium text-foreground cursor-pointer"
                            >
                              {template?.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* NDA Statistics */}
          {data?.ndaEnabled && selectedTesters?.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">NDA Status Tracker</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NDAs to Send:</span>
                  <span className="text-sm font-medium text-foreground">
                    {ndaStats?.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NDAs Sent:</span>
                  <span className="text-sm font-medium text-warning">
                    {ndaStats?.sent}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NDAs Signed:</span>
                  <span className="text-sm font-medium text-success">
                    {ndaStats?.signed}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: NDA Preview and Editor */}
        <div className="lg:col-span-2">
          {data?.ndaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">NDA Template Editor</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Download Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Preview
                  </Button>
                </div>
              </div>

              {/* NDA Editor */}
              <div className="border border-border rounded-lg">
                <div className="bg-muted/30 px-4 py-2 border-b border-border">
                  <p className="text-xs text-muted-foreground">
                    Use placeholders: {`{customer_name}, {company_name}, {date}`}
                  </p>
                </div>
                <textarea
                  value={data?.ndaTemplate || ''}
                  onChange={(e) => handleTemplateChange(e?.target?.value)}
                  placeholder="Enter your NDA content here..."
                  rows={20}
                  className="w-full p-4 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  NDAs will be automatically sent to selected testers after campaign creation
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="RefreshCw"
                    iconPosition="left"
                    iconSize={14}
                    onClick={() => handleTemplateSelection('standard')}
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AppIcon name="FileX" size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">NDA Not Required</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Beta testers will have direct access to your program without signing an NDA. 
                Enable NDA requirements if you're sharing confidential information.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced NDA Summary with Actions */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">NDA Workflow Summary</h4>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline" 
              size="sm"
              onClick={onSendNow}
              disabled={loading || !data?.ndaEnabled || !data?.ndaTemplate}
              className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
              iconName="Send"
              iconPosition="left"
              iconSize={14}
            >
              Send NDA Now
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">NDA Status:</span>
            <p className="font-medium text-foreground">
              {data?.ndaEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Template:</span>
            <p className="font-medium text-foreground">
              {data?.ndaTemplate ? 'Configured' : 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Target Testers:</span>
            <p className="font-medium text-foreground">
              {selectedTesters?.length || 0}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Progress:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">
                {data?.ndasSigned || 0}/{data?.ndasSent || 0}
              </span>
              <span className="text-xs text-muted-foreground">signed</span>
            </div>
          </div>
        </div>

        {/* Progress Status for NDAs */}
        {(data?.ndasSent > 0 || data?.ndasSigned > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress Status:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">NDAs Sent: {data?.ndasSent || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Signed: {data?.ndasSigned || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NdaWorkflowStep;