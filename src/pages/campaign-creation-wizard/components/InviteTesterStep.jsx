import React, { useState, useEffect } from 'react';
import { getCustomers } from '../../../services/customerService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Checkbox from '../../../components/ui/Checkbox';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import AppIcon from '../../../components/AppIcon';
import GoogleOAuthButton from '../../../components/oauth/GoogleOAuthButton';
import { googleOAuthService } from '../../../services/googleOAuthService';
import { resendEmailService } from '../../../services/resendEmailService';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';




const InviteTesterStep = ({ data, updateData, onSendNow, campaignState, loading }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [sendingViaGmail, setSendingViaGmail] = useState(false);

  // Resend email state
  const [sendingViaResend, setSendingViaResend] = useState(false);
  const [resendConfig, setResendConfig] = useState(null);

  // Get authentication context
  const { user, session } = useAuth();

  // Email template options
  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome to Beta Program',
      subject: 'You\'re invited to join our beta program!',
      content: 'Hi {{first_name}},\n\nWe\'re excited to invite you to participate in our beta program for {{campaign_name}}. Your feedback will be invaluable in helping us improve our product.\n\nBest regards,\n'
    },
    {
      id: 'exclusive',
      name: 'Exclusive Beta Access',
      subject: 'Exclusive beta access - {{campaign_name}}',
      content: 'Hello {{first_name}},\n\nYou\'ve been selected for exclusive early access to {{campaign_name}}. This is a limited opportunity to experience our latest features before anyone else.\n\nThank you,\n'
    }
  ];

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const result = await getCustomers();
        if (result?.data) {
          setCustomers(result?.data);
          setFilteredCustomers(result?.data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Enhanced Load Resend configuration with authentication check
  // useEffect(() => {
  //   const loadResendConfig = async () => {
  //     // Wait for user to be loaded and ensure valid session
  //     if (!user?.id || !session) {
  //       console.warn('No authenticated user found, skipping Resend config load');
  //       return;
  //     }

  //     try {
  //       const result = await resendEmailService?.getUserConfig(user?.id);
  //       if (result?.success && result?.data?.sender_email && result?.data?.sender_name) {
  //         console.log('Resend config loaded:', result?.data);
  //         setResendConfig(result.data);
  //       } else {
  //         console.warn('Resend config missing required fields:', result?.data);
  //         updateData({ resendError: 'Resend configuration incomplete. Please check sender settings.' });
  //       }
        
  //       if (result?.success && result?.data) {
  //         console.log('Resend config loaded:', result?.data);
  //         setResendConfig(result?.data);
  //       } else if (result?.error) {
  //         console.warn('Failed to load Resend config:', result?.error);
  //       }
  //     } catch (error) {
  //       console.error('Error loading Resend config:', error);
  //     }
  //   };

  //   loadResendConfig();
  // }, [user?.id, session]); // Depend on user and session

  useEffect(() => {
    const loadResendConfig = async () => {
      // Wait for user to be loaded and ensure valid session
      if (!user?.id || !session) {
        console.warn('No authenticated user found, skipping Resend config load');
        return;
      }
  
      try {
        const result = await resendEmailService?.getUserConfig(user?.id);
  
        if (result?.success && result?.data?.sender_email && result?.data?.sender_name) {
          console.log('Resend config loaded:', result.data);
          setResendConfig(result.data);
        } else if (result?.success) {
          console.warn('Resend config missing required fields:', result.data);
          updateData({ resendError: 'Resend configuration incomplete. Please check sender settings.' });
        } else if (result?.error) {
          console.warn('Failed to load Resend config:', result.error);
        }
      } catch (error) {
        console.error('Error loading Resend config:', error);
      }
    };
  
    loadResendConfig();
  }, [user?.id, session]);
  

  // Filter customers based on search and segment
  useEffect(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm?.trim()) {
      filtered = filtered?.filter(customer =>
        `${customer?.first_name} ${customer?.last_name}`?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        customer?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        customer?.job_title?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Segment filter
    if (selectedSegment !== 'all') {
      filtered = filtered?.filter(customer =>
        customer?.segments?.includes(selectedSegment) ||
        customer?.participation_status === selectedSegment
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, selectedSegment]);

  // Handle tester selection
  const handleTesterToggle = (customer) => {
    const selectedTesters = data?.selectedTesters || [];
    const isSelected = selectedTesters?.some(tester => tester?.id === customer?.id);
    
    if (isSelected) {
      updateData({
        selectedTesters: selectedTesters?.filter(tester => tester?.id !== customer?.id)
      });
    } else {
      updateData({
        selectedTesters: [...selectedTesters, customer]
      });
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    const selectedTesters = data?.selectedTesters || [];
    const allSelected = filteredCustomers?.every(customer =>
      selectedTesters?.some(tester => tester?.id === customer?.id)
    );
    
    if (allSelected) {
      // Deselect all filtered customers
      const remainingTesters = selectedTesters?.filter(tester =>
        !filteredCustomers?.some(customer => customer?.id === tester?.id)
      );
      updateData({ selectedTesters: remainingTesters });
    } else {
      // Select all filtered customers
      const newTesters = filteredCustomers?.filter(customer =>
        !selectedTesters?.some(tester => tester?.id === customer?.id)
      );
      updateData({
        selectedTesters: [...selectedTesters, ...newTesters]
      });
    }
  };

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    const template = emailTemplates?.find(t => t?.id === templateId);
    if (template) {
      updateData({
        selectedTemplate: template,
        emailSubject: template?.subject?.replace('{{campaign_name}}', data?.name || 'Beta Campaign'),
        emailContent: template?.content?.replace('{{campaign_name}}', data?.name || 'Beta Campaign')
      });
    }
  };

  // Handle AI generation (placeholder)
  const handleAIGeneration = () => {
    // Placeholder for AI integration
    updateData({
      emailSubject: `Join our exclusive beta program - ${data?.name}`,
      emailContent: `Hi there,\n\nWe'd love to have you participate in our beta program for ${data?.name}. Your expertise and feedback would be incredibly valuable.\n\nReady to get started?\n\nBest,\nThe Team`
    });
  };

  // Handle Google OAuth connection change
  const handleGoogleConnectionChange = (connected, email) => {
    setIsGoogleConnected(connected);
    setGoogleEmail(email || '');
    
    // Update campaign data to track Google connection status
    updateData({
      googleConnected: connected,
      googleEmail: email || ''
    });
  };

  // Enhanced Resend email sending with better authentication handling
  const handleSendViaResend = async () => {
    if (!data?.selectedTesters?.length) {
      console.error('No testers selected for invitation');
      return;
    }

    if (!data?.emailSubject) {
      console.error('Email subject is required');
      return;
    }

    // Enhanced authentication check
    if (!user?.id || !session) {
      console.error('User authentication required for sending emails');
      updateData({
        testersPending: data?.selectedTesters?.length || 0,
        resendError: 'Authentication required - please sign in again'
      });
      return;
    }

    // ✅ Validate Resend config early
    if (!resendConfig?.sender_email || !resendConfig?.sender_name) {
      console.error('Missing sender configuration for Resend');
      updateData({ resendError: 'Missing sender configuration' });
      return;
    }
    try {
      setSendingViaResend(true);

      // Prepare invitations data for Resend
      const invitations = data?.selectedTesters?.map(tester => ({
        email: tester?.email,
        firstName: tester?.first_name,
        lastName: tester?.last_name,
        betaInvitationId: null // Will be created if needed
      }));

      const { data: insertedCampaign, error: insertError } = await supabase
      .from('beta_programs')
      .insert([{
        name: data?.name,
        description: data?.description || '',
        created_by: user?.id,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert campaign:', insertError);
      updateData({ resendError: 'Failed to create campaign before sending emails' });
      return;
    }

    // Update campaign ID for downstream use
    updateData({ betaProgramId: insertedCampaign?.id });

    // Prepare invitation payload
      const invitationPayload = data?.selectedTesters?.map(tester => ({
        beta_program_id: insertedCampaign?.id,
        customer_id: tester?.id,
        invited_by: user?.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      }));

      // Insert invitations
      const { data: insertedInvites, error: inviteError } = await supabase
        .from('beta_invitations')
        .insert(invitationPayload);

      if (inviteError) {
        console.error('Failed to insert invitations:', inviteError);
        updateData({ resendError: 'Failed to create invitations after campaign insert' });
        return;
      }

      // Optional: enrich invitations with Supabase IDs for Resend
      const enrichedInvitations = data?.selectedTesters?.map((tester, index) => ({
        email: tester?.email,
        firstName: tester?.first_name,
        lastName: tester?.last_name,
        betaInvitationId: insertedInvites?.[index]?.id || null
      }));

      // Campaign data for email content
      const campaignData = {
        campaignName: data?.name,
        campaignId: data?.betaProgramId,
        emailSubject: data?.emailSubject,
        emailContent: data?.emailContent,
        senderName: resendConfig?.sender_name || 'PM Name (PilotBeta)'
      };

      // User configuration
      const userConfig = {
        senderEmail: resendConfig?.sender_email || 'PM Name (PilotBeta) <notifications@PilotBeta.com>',
        senderName: resendConfig?.sender_name || 'PM Name (PilotBeta)'
      };

      // Send batch invitations via Resend
      const result = await resendEmailService?.sendBatchInvitations(enrichedInvitations, campaignData, userConfig);
      // ✅ Log full response for debugging
      console.log('Resend full response:', result);

      if (result?.success) {
        const successCount = result?.stats?.sent || 0;
        const failureCount = result?.stats?.failed || 0;

        // Update campaign data with results
        updateData({
          testersInvited: (data?.testersInvited || 0) + successCount,
          testersPending: failureCount,
          resendResults: result?.data,
          emailProvider: 'resend'
        });

        // Show success notification
        if (successCount > 0) {
          console.log(`Successfully sent ${successCount} invitations via Resend`);
        }

        if (failureCount > 0) {
          console.error(`Failed to send ${failureCount} invitations via Resend`);
          // ✅ Surface partial failure to UI
          updateData({
            resendError: `${failureCount} invitations failed to send via Resend`,
            testersPending: failureCount
          });
        }

        // ✅ Inspect individual failures (if available)
        const failedEmails = result?.data?.filter(inv => !inv?.success);
        if (failedEmails?.length) {
          console.error('Failed invitations:', failedEmails);
          updateData({
            resendError: `${failedEmails.length} invitations failed`,
            testersPending: failedEmails.length
          });
        }

      } else {
        throw new Error(result?.error || 'Failed to send emails via Resend');
      }

    } catch (error) {
      console.error('Resend send error:', error);
      updateData({
        testersPending: data?.selectedTesters?.length || 0,
        resendError: error?.message
      });
    } finally {
      setSendingViaResend(false);
    }
  };

  // Handle send invitations via Gmail
  const handleSendViaGmail = async () => {
    if (!isGoogleConnected) {
      return;
    }

    if (!data?.selectedTesters?.length) {
      return;
    }

    try {
      setSendingViaGmail(true);

      // Prepare invitations data
      const invitations = data?.selectedTesters?.map(tester => ({
        email: tester?.email,
        firstName: tester?.first_name,
        lastName: tester?.last_name,
        betaInvitationId: null // Will be created if needed
      }));

      // Campaign data for email content
      const campaignData = {
        campaignName: data?.name,
        emailSubject: data?.emailSubject,
        emailContent: data?.emailContent,
        senderName: googleEmail
      };

      // Send batch invitations via Gmail API
      const results = await googleOAuthService?.sendBatchInvitations(invitations, campaignData);

      // Count success and failures
      const successCount = results?.filter(r => r?.success)?.length || 0;
      const failureCount = results?.filter(r => !r?.success)?.length || 0;

      // Update campaign data with results
      updateData({
        testersInvited: successCount,
        testersPending: failureCount,
        gmailResults: results
      });

      // Show results
      if (successCount > 0) {
        // Success notification would be handled by parent component
        console.log(`Successfully sent ${successCount} invitations via Gmail`);
      }

      if (failureCount > 0) {
        console.log(`Failed to send ${failureCount} invitations`);
      }

    } catch (error) {
      console.error('Gmail send error:', error);
      updateData({
        testersPending: data?.selectedTesters?.length || 0,
        gmailError: error?.message
      });
    } finally {
      setSendingViaGmail(false);
    }
  };

  const selectedCount = data?.selectedTesters?.length || 0;
  const allSelected = filteredCustomers?.length > 0 && filteredCustomers?.every(customer =>
    data?.selectedTesters?.some(tester => tester?.id === customer?.id)
  );

  if (loading || isLoading) {
    return <LoadingIndicator message="Loading testers..." />;
  }

  return (
    <div className="space-y-8">
      {/* Campaign Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Campaign Configuration */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Campaign Setup</h3>
            
            <div className="space-y-4">
              <Input
                label="Campaign Name"
                value={data?.name || ''}
                onChange={(e) => updateData({ name: e?.target?.value })}
                placeholder="Enter campaign name"
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Campaign Description
                </label>
                <textarea
                  value={data?.description || ''}
                  onChange={(e) => updateData({ description: e?.target?.value })}
                  placeholder="Describe your beta campaign goals and expectations"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Google OAuth Integration */}
          {/* <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Gmail Integration</h3>
            <div className="space-y-4">
              <GoogleOAuthButton
                onConnectionChange={handleGoogleConnectionChange}
                showDisconnect={true}
              />
              
              
              {isGoogleConnected && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AppIcon name="Zap" size={14} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Gmail Direct Send</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send invitations directly from your Gmail account ({googleEmail}) to preserve your identity and improve deliverability.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendViaGmail}
                    disabled={sendingViaGmail || selectedCount === 0 || !data?.emailSubject}
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    iconName="Send"
                    iconPosition="left"
                    iconSize={12}
                  >
                    {sendingViaGmail ? (
                      <>
                        <AppIcon name="Loader2" size={12} className="animate-spin mr-2" />
                        Sending via Gmail...
                      </>
                    ) : (
                      `Send ${selectedCount} via Gmail`
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div> */}

          {/* Enhanced Email Provider Integration */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Email Provider Options</h3>
            <div className="space-y-4">
              {/* Gmail Integration */}
              {/* <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <AppIcon name="Mail" size={16} className="mr-2" />
                  Gmail Integration
                </h4>
                <GoogleOAuthButton  
                  onConnectionChange={handleGoogleConnectionChange}
                  showDisconnect={true}
                />
                
                {isGoogleConnected && (
                  <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AppIcon name="Zap" size={14} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">Gmail Direct Send</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Send from: {googleEmail}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendViaGmail}
                      disabled={sendingViaGmail || selectedCount === 0 || !data?.emailSubject}
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      iconName="Send"
                      iconPosition="left"
                      iconSize={12}
                    >
                      {sendingViaGmail ? 'Sending via Gmail...' : `Send ${selectedCount} via Gmail`}
                    </Button>
                  </div>
                )}
              </div> */}

              {/* Resend Integration */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <AppIcon name="Send" size={16} className="mr-2" />
                  Resend Integration
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AppIcon name="CheckCircle" size={14} className="text-success" />
                      <span className="text-sm font-medium text-foreground">Resend Email Service</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Send from: {resendConfig?.sender_email || 'notifications@PilotBeta.com'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendViaResend}
                        disabled={sendingViaResend || selectedCount === 0 || !data?.emailSubject}
                        className="bg-success/10 text-success border-success/20 hover:bg-success/20"
                        iconName="Send"
                        iconPosition="left"
                        iconSize={12}
                      >
                        {sendingViaResend ? (
                          <>
                            <AppIcon name="Loader2" size={12} className="animate-spin mr-2" />
                            Sending via Resend...
                          </>
                        ) : (
                          `Send ${selectedCount} via Resend`
                        )}
                      </Button>
                      
                      {/* Resend Status Indicator */}
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-success">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Campaign Email</h3>
            
            <div className="space-y-4">
              {/* Email Option Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Option
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="template"
                      name="emailOption"
                      value="template"
                      checked={data?.emailOption === 'template'}
                      onChange={(e) => updateData({ emailOption: e?.target?.value })}
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="template" className="text-sm text-foreground">
                      Use Saved Email Template
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="ai"
                      name="emailOption"
                      value="ai"
                      checked={data?.emailOption === 'ai'}
                      onChange={(e) => updateData({ emailOption: e?.target?.value })}
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="ai" className="text-sm text-foreground">
                      Generate with AI
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="scratch"
                      name="emailOption"
                      value="scratch"
                      checked={data?.emailOption === 'scratch'}
                      onChange={(e) => updateData({ emailOption: e?.target?.value })}
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor="scratch" className="text-sm text-foreground">
                      Write from Scratch
                    </label>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              {data?.emailOption === 'template' && (
                <Select
                  label="Email Template"
                  value={data?.selectedTemplate?.id || ''}
                  onChange={(value) => handleTemplateChange(value)}
                  options={[
                    { value: '', label: 'Select a template' },
                    ...emailTemplates?.map(template => ({
                      value: template?.id,
                      label: template?.name
                    }))
                  ]}
                />
              )}

              {/* AI Generation */}
              {data?.emailOption === 'ai' && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate email content using AI based on your campaign details
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleAIGeneration}
                    iconName="Sparkles"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Generate with AI
                  </Button>
                </div>
              )}

              {/* Email Subject & Content */}
              {(data?.emailOption === 'scratch' || data?.emailSubject) && (
                <>
                  <Input
                    label="Email Subject"
                    value={data?.emailSubject || ''}
                    onChange={(e) => updateData({ emailSubject: e?.target?.value })}
                    placeholder="Enter email subject"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Content
                    </label>
                    <textarea
                      value={data?.emailContent || ''}
                      onChange={(e) => updateData({ emailContent: e?.target?.value })}
                      placeholder="Write your email content here..."
                      rows={6}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tester Selection */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Tester Selection</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AppIcon name="Users" size={16} />
                <span>{selectedCount} testers selected</span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3 mb-4">
              <Input
                placeholder="Search testers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                iconName="Search"
                iconPosition="left"
              />
              
              <div className="flex items-center space-x-3">
                <Select
                  value={selectedSegment}
                  onChange={setSelectedSegment}
                  options={[
                    { value: 'all', label: 'All Segments' },
                    { value: 'enterprise', label: 'Enterprise' },
                    { value: 'startup', label: 'Startup' },
                    { value: 'individual', label: 'Individual' },
                    { value: 'active', label: 'Active Users' },
                    { value: 'invited', label: 'Invited Users' }
                  ]}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  iconName="Upload"
                  iconPosition="left"
                  iconSize={16}
                >
                  Upload CSV
                </Button>
              </div>
            </div>

            {/* Select All Toggle */}
            {filteredCustomers?.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    label=""
                    checked={allSelected}
                    onChange={handleSelectAll}
                    error=""
                  />
                  <span className="text-sm font-medium text-foreground">
                    Select All ({filteredCustomers?.length})
                  </span>
                </div>
              </div>
            )}

            {/* Customer List */}
            <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
              {filteredCustomers?.map((customer) => {
                const isSelected = data?.selectedTesters?.some(tester => tester?.id === customer?.id);
                
                return (
                  <div
                    key={customer?.id}
                    className={`flex items-center space-x-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleTesterToggle(customer)}
                  >
                    <Checkbox
                      id={`customer-${customer?.id}`}
                      label=""
                      checked={isSelected}
                      onChange={() => handleTesterToggle(customer)}
                      error=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">
                          {customer?.first_name} {customer?.last_name}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer?.participation_status === 'active' ? 'bg-success/10 text-success'
                            : customer?.participation_status === 'invited' ? 'bg-warning/10 text-warning' : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {customer?.participation_status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer?.email}
                        {customer?.job_title && ` • ${customer?.job_title}`}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredCustomers?.length === 0 && (
                <div className="p-8 text-center">
                  <AppIcon name="Users" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No testers found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Campaign Summary with Resend Support */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Campaign Summary</h4>
          <div className="flex items-center space-x-3">
            {/* Live Counter */}
            <div className="flex items-center space-x-2 text-sm">
              <AppIcon name="Users" size={16} className="text-primary" />
              <span className="font-medium text-foreground">
                {selectedCount} testers selected
              </span>
            </div>
            
            {/* Enhanced Send Now Actions */}
            <div className="flex items-center space-x-2">
              {/* Gmail Direct Send */}
              {isGoogleConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendViaGmail}
                  disabled={sendingViaGmail || selectedCount === 0 || !data?.emailSubject}
                  className="bg-blue/10 text-blue border-blue/20 hover:bg-blue/20"
                  iconName="Mail"
                  iconPosition="left"
                  iconSize={14}
                >
                  Send via Gmail
                </Button>
              )}
              
              {/* Resend Direct Send */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendViaResend}
                disabled={sendingViaResend || selectedCount === 0 || !data?.emailSubject}
                className="bg-success/10 text-success border-success/20 hover:bg-success/20"
                iconName="Send"
                iconPosition="left"
                iconSize={14}
              >
                Send via Resend
              </Button>
              
              {/* Regular Send */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={onSendNow}
                disabled={loading || selectedCount === 0 || !data?.emailSubject}
                className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                iconName="Zap"
                iconPosition="left"
                iconSize={14}
              >
                Send Invitations Now
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-muted/10 text-muted-foreground border-muted/20 cursor-not-allowed"
                iconName="Zap"
                iconPosition="left"
                iconSize={14}
              >
                Send Invitations Now
              </Button>

            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Campaign:</span>
            <p className="font-medium text-foreground">{data?.name || 'Untitled Campaign'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Testers Selected:</span>
            <p className="font-medium text-foreground">{selectedCount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Send Method:</span>
            <p className="font-medium text-foreground">
              {data?.emailProvider === 'resend' ? 'Resend'
                : isGoogleConnected ? `Gmail (${googleEmail})` 
                : 'Platform Email'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                campaignState === 'draft' ? 'bg-muted/50 text-muted-foreground'
                : campaignState === 'in_progress'? 'bg-warning/10 text-warning' :'bg-success/10 text-success'
              }`}>
                {campaignState === 'draft' ? 'Draft'
                  : campaignState === 'in_progress'? 'In Progress' :'Launched'}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Status */}
        {(data?.testersInvited > 0 || data?.testersPending > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress Status:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-foreground">Testers Invited: {data?.testersInvited || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-foreground">Pending: {data?.testersPending || 0}</span>
                </div>
                
                {/* Provider Status Indicators */}
                <div className="flex items-center space-x-3">
                  {isGoogleConnected && (
                    <div className="flex items-center space-x-1">
                      <AppIcon name="Mail" size={12} className="text-blue" />
                      <span className="text-foreground text-xs">Gmail</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <AppIcon name="Send" size={12} className="text-success" />
                    <span className="text-foreground text-xs">Resend</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteTesterStep;