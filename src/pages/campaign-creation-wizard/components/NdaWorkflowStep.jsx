import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';
import AppIcon from '../../../components/AppIcon';

import Select from '../../../components/ui/Select';
import { campaignCreationService } from '../../../services/campaignCreationService';

const NdaWorkflowStep = ({ data, updateData, onSendNow, campaignState, loading, selectedTesters = [] }) => {
  const [ndaStats, setNdaStats] = useState({
    sent: 0,
    signed: 0,
    pending: 0
  });

  // New state for campaign selection
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignTesters, setCampaignTesters] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignNdaStats, setCampaignNdaStats] = useState({ sent: 0, signed: 0, pending: 0 });

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

  // Load available campaigns when component mounts
  useEffect(() => {
    loadAvailableCampaigns();
  }, []);

  // Load campaign-specific data when campaign is selected
  useEffect(() => {
    if (selectedCampaign?.id) {
      loadCampaignData(selectedCampaign?.id);
    }
  }, [selectedCampaign]);

  // Calculate NDA statistics
  useEffect(() => {
    const testersToUse = selectedCampaign ? campaignTesters : selectedTesters;
    if (selectedCampaign) {
      // Use campaign-specific stats
      setNdaStats(campaignNdaStats);
    } else if (testersToUse?.length > 0) {
      setNdaStats({
        sent: 0, // Would come from actual data
        signed: 0, // Would come from actual data
        pending: testersToUse?.length
      });
    }
  }, [selectedTesters, campaignTesters, selectedCampaign, campaignNdaStats]);

   // Load available campaigns
   const loadAvailableCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const result = await campaignCreationService?.getAllCampaigns();
      if (result?.success) {
        setAvailableCampaigns(result?.data || []);
        // Auto-select if only one campaign exists
        if (result?.data?.length === 1) {
          setSelectedCampaign(result?.data?.[0]);
        }
      }
    } catch (error) {
      console.log('Failed to load campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Load campaign-specific data
  const loadCampaignData = async (campaignId) => {
    try {
      setLoadingCampaigns(true);
      
      // Load campaign invitations to get testers
      const invitationsResult = await campaignCreationService?.getBetaInvitations(campaignId);
      if (invitationsResult?.success) {
        const testers = invitationsResult?.data?.map(inv => ({
          id: inv?.customers?.id,
          name: `${inv?.customers?.first_name || ''} ${inv?.customers?.last_name || ''}`?.trim(),
          email: inv?.customers?.email,
          invitation_status: inv?.status,
          beta_invitation_id: inv?.id
        }));
        setCampaignTesters(testers);
        
        // Calculate NDA stats for this campaign
        const responded = testers?.filter(t => t?.invitation_status === 'responded');
        setCampaignNdaStats({
          pending: responded?.length || 0,
          sent: 0, // Would need to query nda_documents table
          signed: 0 // Would need to query signed NDAs
        });
      }

      // Load NDA documents for this campaign if needed
      const ndaResult = await campaignCreationService?.getCampaignNdaDocuments(campaignId);
      if (ndaResult?.success) {
        const ndaDocs = ndaResult?.data || [];
        setCampaignNdaStats(prev => ({
          ...prev,
          sent: ndaDocs?.length || 0,
          signed: ndaDocs?.filter(doc => doc?.status === 'signed')?.length || 0
        }));
      }
      
    } catch (error) {
      console.log('Failed to load campaign data:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Handle campaign selection change
  const handleCampaignChange = (campaignId) => {
    const campaign = availableCampaigns?.find(c => c?.id === campaignId);
    setSelectedCampaign(campaign);
    
    // Update parent component with selected campaign info
    updateData({ 
      selectedCampaignId: campaignId,
      selectedCampaignName: campaign?.name 
    });
  };

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

  // New handler for NDA handling type (internal vs external)
  const handleNdaHandlingTypeChange = (type) => {
    updateData({ 
      ndaHandlingType: type,
      // Reset template-related data when switching to external
      ...(type === 'external' && {
        ndaTemplate: '',
        ndaTitle: '',
        externalNdaInstructions: ''
      })
    });
  };

  // Enhanced Send Now for selected campaign
  const handleSendNdaNow = async () => {
    if (!selectedCampaign) {
      alert('Please select a campaign first');
      return;
    }
    
    if (!data?.ndaEnabled) {
      alert('Please enable NDA first');
      return;
    }

    if (data?.ndaHandlingType === 'internal' && !data?.ndaTemplate) {
      alert('Please configure NDA template for internal handling');
      return;
    }

    if (data?.ndaHandlingType === 'external' && !data?.externalNdaInstructions) {
      alert('Please provide external NDA handling instructions');
      return;
    }

    const testersToSendTo = campaignTesters?.filter(t => t?.invitation_status === 'responded');
    if (!testersToSendTo?.length) {
      alert('No testers have responded to invitations in this campaign yet');
      return;
    }

    // Call the original onSendNow with campaign context
    await onSendNow();
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

  // Get effective testers list (either campaign-specific or wizard-selected)
  const getEffectiveTesters = () => {
    return selectedCampaign ? campaignTesters : selectedTesters;
  };

  return (
    <div className="space-y-8">
      {/* Campaign Selection Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AppIcon name="Target" size={20} className="text-primary" />
          <h3 className="text-lg font-medium text-foreground">Campaign Selection</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Campaign for NDA Step
            </label>
            <Select
              value={selectedCampaign?.id || ''}
              onChange={(value) => handleCampaignChange(value)}
              disabled={loadingCampaigns}
              placeholder={loadingCampaigns ? "Loading campaigns..." : "Select a campaign"}
              options={[
                { value: '', label: 'Select a campaign', disabled: true },
                ...availableCampaigns?.map(campaign => ({
                  value: campaign?.id,
                  label: `${campaign?.name} ${campaign?.is_active ? '(Active)' : '(Draft)'}`
                }))
              ]}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Choose which campaign you want to manage NDAs for. You can work on any step for any campaign.
            </p>
          </div>
          
          {selectedCampaign && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Selected Campaign</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{selectedCampaign?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${selectedCampaign?.is_active ? 'text-success' : 'text-warning'}`}>
                    {selectedCampaign?.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invited Testers:</span>
                  <span className="font-medium text-foreground">{campaignTesters?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responded:</span>
                  <span className="font-medium text-primary">
                    {campaignTesters?.filter(t => t?.invitation_status === 'responded')?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  {/* NEW: NDA Handling Type Selection */}
                  <div className="bg-muted/20 border border-border rounded-lg p-4">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      NDA Handling Method
                    </label>
                    <div className="space-y-3">
                      {/* Internal NDA Option */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="nda-internal"
                          name="ndaHandlingType"
                          value="internal"
                          checked={data?.ndaHandlingType === 'internal' || !data?.ndaHandlingType}
                          onChange={(e) => handleNdaHandlingTypeChange('internal')}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor="nda-internal" className="text-sm font-medium text-foreground cursor-pointer">
                            Internal NDA Management
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use PilotBeta's built-in NDA system to send, track, and manage signatures electronically
                          </p>
                          {(data?.ndaHandlingType === 'internal' || !data?.ndaHandlingType) && (
                            <div className="mt-2 flex items-center space-x-2 text-xs">
                              <AppIcon name="CheckCircle" size={14} className="text-success" />
                              <span className="text-success">Automated tracking & reminders</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* External NDA Option */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="nda-external"
                          name="ndaHandlingType"
                          value="external"
                          checked={data?.ndaHandlingType === 'external'}
                          onChange={(e) => handleNdaHandlingTypeChange('external')}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor="nda-external" className="text-sm font-medium text-foreground cursor-pointer">
                            External NDA Management
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Handle NDAs outside PilotBeta using your own legal tools or processes
                          </p>
                          {data?.ndaHandlingType === 'external' && (
                            <div className="mt-2 flex items-center space-x-2 text-xs">
                              <AppIcon name="ExternalLink" size={14} className="text-primary" />
                              <span className="text-primary">Managed externally</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditional sections based on handling type */}
                  {data?.ndaHandlingType === 'external' ? (
                    // External NDA Instructions
                    (<div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        External NDA Instructions
                      </label>
                      <textarea
                        value={data?.externalNdaInstructions || ''}
                        onChange={(e) => updateData({ externalNdaInstructions: e?.target?.value })}
                        placeholder="Describe how you'll handle NDAs externally (e.g., 'NDAs will be sent via DocuSign by our legal team', 'Testers will receive NDA from legal@company.com')"
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        These instructions will be displayed to testers and your team
                      </p>
                    </div>)
                  ) : (
                    // Internal NDA Configuration (existing)
                    (<>
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
                    </>)
                  )}
                </>
              )}
            </div>
          </div>

          {/* Updated NDA Statistics - Show different info for external */}
          {data?.ndaEnabled && getEffectiveTesters()?.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">NDA Status Tracker</h4>
                {selectedCampaign && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {selectedCampaign?.name}
                  </span>
                )}
              </div>
              
              {data?.ndaHandlingType === 'external' ? (
                // External NDA Status Display
                (<div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Handling:</span>
                    <span className="text-sm font-medium text-primary flex items-center space-x-1">
                      <AppIcon name="ExternalLink" size={14} />
                      <span>External</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Testers:</span>
                    <span className="text-sm font-medium text-foreground">
                      {getEffectiveTesters()?.length}
                    </span>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded p-3 mt-3">
                    <div className="flex items-start space-x-2">
                      <AppIcon name="Info" size={14} className="text-warning mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-warning">Manual Tracking Required</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You'll need to manually track NDA status in your external system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>)
              ) : (
                // Internal NDA Status Display (existing)
                (<div className="space-y-3">
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
                  {selectedCampaign && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Campaign Testers:</span>
                        <span>{campaignTesters?.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Responded to Invite:</span>
                        <span className="text-primary">
                          {campaignTesters?.filter(t => t?.invitation_status === 'responded')?.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>)
              )}
            </div>
          )}

          {/* Campaign Selection Prompt */}
          {!selectedCampaign && availableCampaigns?.length > 1 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AppIcon name="Info" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">Campaign Selection Required</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Please select a campaign above to see relevant testers and NDA progress for that specific campaign.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: NDA Preview and Editor - Updated for External */}
        <div className="lg:col-span-2">
          {data?.ndaEnabled ? (
            <div className="space-y-4">
              {data?.ndaHandlingType === 'external' ? (
                // External NDA Management Interface
                (<div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">External NDA Management</h3>
                    {selectedCampaign && (
                      <p className="text-sm text-muted-foreground">
                        Managing NDAs externally for campaign: <span className="text-foreground font-medium">{selectedCampaign?.name}</span>
                      </p>
                    )}
                  </div>
                  {/* External NDA Instructions Display */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AppIcon name="ExternalLink" size={20} className="text-primary" />
                      <h4 className="font-medium text-foreground">External Process Instructions</h4>
                    </div>
                    
                    {data?.externalNdaInstructions ? (
                      <div className="space-y-4">
                        <div className="bg-muted/20 rounded-lg p-4">
                          <p className="text-sm text-foreground leading-relaxed">
                            {data?.externalNdaInstructions}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div className="text-center">
                            <AppIcon name="Users" size={24} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">{getEffectiveTesters()?.length}</p>
                            <p className="text-xs text-muted-foreground">Testers requiring NDAs</p>
                          </div>
                          <div className="text-center">
                            <AppIcon name="Clock" size={24} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">Manual</p>
                            <p className="text-xs text-muted-foreground">Tracking required</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AppIcon name="FileQuestion" size={32} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Please provide instructions for how NDAs will be handled externally
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Edit"
                          iconPosition="left"
                          iconSize={14}
                          onClick={() => {
                            // Focus the textarea in the left column
                            const textarea = document.querySelector('textarea[placeholder*="Describe how"]');
                            if (textarea) textarea?.focus();
                          }}
                        >
                          Add Instructions
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* External NDA Checklist */}
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AppIcon name="CheckSquare" size={20} className="text-warning" />
                      <h4 className="font-medium text-foreground">External NDA Checklist</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <AppIcon name="Square" size={16} className="text-muted-foreground mt-0.5" />
                        <span className="text-foreground">Prepare NDA documents using your legal tools</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AppIcon name="Square" size={16} className="text-muted-foreground mt-0.5" />
                        <span className="text-foreground">Send NDAs to {getEffectiveTesters()?.length} selected testers</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AppIcon name="Square" size={16} className="text-muted-foreground mt-0.5" />
                        <span className="text-foreground">Track signatures and completion status manually</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AppIcon name="Square" size={16} className="text-muted-foreground mt-0.5" />
                        <span className="text-foreground">Grant beta access once NDAs are signed</span>
                      </div>
                    </div>
                  </div>
                  {/* Tester List for External Handling */}
                  {getEffectiveTesters()?.length > 0 && (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h4 className="font-medium text-foreground mb-4">Testers Requiring External NDAs</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getEffectiveTesters()?.map((tester, index) => (
                          <div key={tester?.id || index} className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded">
                            <div>
                              <p className="text-sm font-medium text-foreground">{tester?.name || 'Unnamed Tester'}</p>
                              <p className="text-xs text-muted-foreground">{tester?.email}</p>
                            </div>
                            <AppIcon name="ExternalLink" size={14} className="text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>)
              ) : (
                // Internal NDA Management Interface (existing)
                (<div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">NDA Template Editor</h3>
                      {selectedCampaign && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Editing for campaign: <span className="text-foreground font-medium">{selectedCampaign?.name}</span>
                        </p>
                      )}
                    </div>
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
                        Use placeholders: {`{{customer_name}}, {{company_name}}, {{date}}`}
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
                      {selectedCampaign 
                        ? `NDAs will be sent to responded testers in "${selectedCampaign?.name}"`
                        : 'NDAs will be sent to selected testers after campaign creation'
                      }
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
                </div>)
              )}
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
      {/* Updated NDA Summary with External/Internal Context */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-foreground">NDA Workflow Summary</h4>
            {selectedCampaign && (
              <p className="text-sm text-muted-foreground">
                Working on: <span className="text-foreground font-medium">{selectedCampaign?.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {data?.ndaHandlingType === 'external' ? (
              <Button
                variant="outline" 
                size="sm"
                onClick={selectedCampaign ? handleSendNdaNow : onSendNow}
                disabled={loading || !data?.ndaEnabled || !data?.externalNdaInstructions || (!selectedCampaign && !selectedTesters?.length)}
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                iconName="ExternalLink"
                iconPosition="left"
                iconSize={14}
              >
                Mark as External
              </Button>
            ) : (
              <Button
                variant="outline" 
                size="sm"
                onClick={selectedCampaign ? handleSendNdaNow : onSendNow}
                disabled={loading || !data?.ndaEnabled || !data?.ndaTemplate || (!selectedCampaign && !selectedTesters?.length)}
                className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                iconName="Send"
                iconPosition="left"
                iconSize={14}
              >
                Send NDA Now
              </Button>
            )}
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
            <span className="text-muted-foreground">Handling:</span>
            <p className="font-medium text-foreground flex items-center space-x-1">
              {data?.ndaHandlingType === 'external' ? (
                <>
                  <AppIcon name="ExternalLink" size={14} />
                  <span>External</span>
                </>
              ) : (
                <>
                  <AppIcon name="Zap" size={14} />
                  <span>Internal</span>
                </>
              )}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Target Testers:</span>
            <p className="font-medium text-foreground">
              {getEffectiveTesters()?.length || 0}
              {selectedCampaign && (
                <span className="text-xs text-muted-foreground ml-1">
                  (Campaign: {selectedCampaign?.name})
                </span>
              )}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Progress:</span>
            <div className="flex items-center space-x-2">
              {data?.ndaHandlingType === 'external' ? (
                <span className="font-medium text-primary">Manual Tracking</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {data?.ndasSigned || ndaStats?.signed || 0}/{data?.ndasSent || ndaStats?.sent || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">signed</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Progress Status */}
        {((data?.ndasSent > 0 || data?.ndasSigned > 0) || selectedCampaign) && data?.ndaHandlingType !== 'external' && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedCampaign ? `${selectedCampaign?.name} Progress:` : 'Progress Status:'}
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">NDAs Sent: {ndaStats?.sent || data?.ndasSent || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Signed: {ndaStats?.signed || data?.ndasSigned || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* External NDA Status */}
        {data?.ndaHandlingType === 'external' && data?.externalNdaInstructions && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-primary/5 border border-primary/20 rounded p-3">
              <div className="flex items-start space-x-2">
                <AppIcon name="ExternalLink" size={16} className="text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">External NDA Process</p>
                  <p className="text-xs text-muted-foreground mt-1">{data?.externalNdaInstructions}</p>
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