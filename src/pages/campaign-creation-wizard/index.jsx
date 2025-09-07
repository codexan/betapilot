import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import AppIcon from '../../components/AppIcon';

// Step Components
import InviteTesterStep from './components/InviteTesterStep';
import NdaWorkflowStep from './components/NdaWorkflowStep';
import ScheduleSlotStep from './components/ScheduleSlotStep';
import ConfirmationStep from './components/ConfirmationStep';

// Services
import { campaignCreationService } from '../../services/campaignCreationService';

const CampaignCreationWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaignState, setCampaignState] = useState('draft'); // draft, in_progress, launched
  const [savedCampaignId, setSavedCampaignId] = useState(null);

  // Campaign data state with enhanced tracking
  const [campaignData, setCampaignData] = useState({
    // Step 1: Invite Beta Testers
    name: `Beta Campaign ${new Date()?.toLocaleDateString()}`,
    description: '',
    selectedTesters: [],
    emailSubject: '',
    emailContent: '',
    emailOption: 'template', // template, ai, scratch
    selectedTemplate: null,
    testersInvited: 0,
    testersPending: 0,
    
    // Step 2: NDA Workflow
    ndaTemplate: '',
    ndaTitle: 'Beta Program Non-Disclosure Agreement',
    ndaEnabled: true,
    ndasSent: 0,
    ndasSigned: 0,
    
    // Step 3: Schedule Beta Slots
    availableSlots: [],
    slotDuration: 30,
    slotsFilled: 0,
    slotsRemaining: 0,
    
    // Step 4: Confirmation
    betaProgramId: null,
    invitations: [],
    ndaDocuments: [],
    calendarSlots: [],
    
    // State tracking
    lastSaved: null,
    autoSaveEnabled: true
  });

  const steps = [
    {
      id: 'invite',
      label: 'Invite Testers',
      title: 'Invite Beta Testers',
      description: 'Select testers and configure campaign details',
      progress: {
        total: campaignData?.selectedTesters?.length || 0,
        completed: campaignData?.testersInvited || 0,
        pending: campaignData?.testersPending || 0
      }
    },
    {
      id: 'nda',
      label: 'NDA Workflow',
      title: 'NDA Workflow',
      description: 'Setup non-disclosure agreements',
      progress: {
        total: campaignData?.ndasSent || 0,
        completed: campaignData?.ndasSigned || 0,
        pending: (campaignData?.ndasSent || 0) - (campaignData?.ndasSigned || 0)
      }
    },
    {
      id: 'schedule',
      label: 'Schedule Slots',
      title: 'Schedule Beta Slots',
      description: 'Define available testing time slots',
      progress: {
        total: campaignData?.availableSlots?.length || 0,
        completed: campaignData?.slotsFilled || 0,
        pending: campaignData?.slotsRemaining || 0
      }
    },
    {
      id: 'confirm',
      label: 'Confirm & Launch',
      title: 'Confirmation & Calendar Integration',
      description: 'Review and launch your campaign',
      progress: {
        total: 1,
        completed: campaignState === 'launched' ? 1 : 0,
        pending: campaignState === 'launched' ? 0 : 1
      }
    }
  ];

  // Auto-save functionality
  useEffect(() => {
    if (campaignData?.autoSaveEnabled && savedCampaignId) {
      const autoSaveTimer = setInterval(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveTimer);
    }
  }, [campaignData, savedCampaignId]);

  // Initialize from location state if available
  useEffect(() => {
    const locationState = location?.state;
    if (locationState?.step) {
      setCurrentStep(parseInt(locationState?.step));
    }
    if (locationState?.campaignId) {
      setSavedCampaignId(locationState?.campaignId);
      // Load existing campaign data
      loadCampaignData(locationState?.campaignId);
    }
  }, [location?.state]);

  // Load existing campaign data
  const loadCampaignData = async (campaignId) => {
    try {
      setLoading(true);
      // Implementation would load campaign data from API
      // const result = await campaignCreationService.getCampaignById(campaignId);
      // if (result?.success) {
      //   setCampaignData(result.data);
      //   setCampaignState(result.data.status);
      // }
    } catch (error) {
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save function
  const handleAutoSave = async () => {
    if (!savedCampaignId || !campaignData?.autoSaveEnabled) return;
    
    try {
      await campaignCreationService?.updateCampaignDraft(savedCampaignId, {
        ...campaignData,
        lastSaved: new Date()?.toISOString()
      });
      
      setCampaignData(prev => ({
        ...prev,
        lastSaved: new Date()?.toISOString()
      }));
    } catch (error) {
      console.log('Auto-save failed:', error);
    }
  };

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep < steps?.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Update campaign data
  const updateCampaignData = (updates) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  // Enhanced Send Now functionality for each step
  const handleSendNow = async (stepId) => {
    try {
      setLoading(true);
      setError(null);
      
      switch (stepId) {
        case 'invite':
          await handleSendInvitations();
          break;
        case 'nda':
          await handleSendNDAs();
          break;
        case 'schedule':
          await handleSendSchedulingEmails();
          break;
        case 'confirm':
          await handleLaunchCampaign();
          break;
        default:
          break;
      }
    } catch (error) {
      setError(error?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  // Send invitations immediately
  const handleSendInvitations = async () => {
    if (!campaignData?.selectedTesters?.length) {
      throw new Error('No testers selected');
    }

    // Create beta program if not exists
    let betaProgramId = savedCampaignId;
    if (!betaProgramId) {
      const programResult = await campaignCreationService?.createBetaProgram({
        name: campaignData?.name,
        description: campaignData?.description,
        start_date: new Date()?.toISOString()?.split('T')?.[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
      });

      if (!programResult?.success) {
        throw new Error('Failed to create beta program');
      }
      betaProgramId = programResult?.data?.id;
      setSavedCampaignId(betaProgramId);
    }

    // Send invitations
    const invitationData = {
      invitations: campaignData?.selectedTesters?.map(tester => ({
        beta_program_id: betaProgramId,
        customer_id: tester?.id,
        email_subject: campaignData?.emailSubject,
        email_content: campaignData?.emailContent,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString()
      }))
    };

    const result = await campaignCreationService?.createBetaInvitations(invitationData);
    if (!result?.success) {
      throw new Error('Failed to send invitations');
    }

    // Update progress
    updateCampaignData({
      invitations: result?.data,
      testersInvited: result?.data?.length || 0,
      testersPending: 0
    });

    setCampaignState('in_progress');
    setError(null);
    
    // Show success message
    setError(null);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Send NDAs to responded testers
  const handleSendNDAs = async () => {
    if (!campaignData?.ndaEnabled) return;

    const respondedTesters = campaignData?.selectedTesters?.filter(tester => 
      campaignData?.invitations?.some(inv => inv?.customer_id === tester?.id && inv?.status === 'responded')
    );

    if (!respondedTesters?.length) {
      throw new Error('No testers have responded to invitations yet');
    }

    const ndaData = {
      ndas: respondedTesters?.map(tester => ({
        customer_id: tester?.id,
        nda_title: campaignData?.ndaTitle,
        nda_content: campaignData?.ndaTemplate,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)?.toISOString()
      }))
    };

    const result = await campaignCreationService?.createNdaDocuments(ndaData);
    if (!result?.success) {
      throw new Error('Failed to send NDAs');
    }

    updateCampaignData({
      ndaDocuments: result?.data,
      ndasSent: result?.data?.length || 0
    });
  };

  // Send scheduling emails
  const handleSendSchedulingEmails = async () => {
    if (!campaignData?.availableSlots?.length) {
      throw new Error('No slots configured');
    }

    // Implementation would send scheduling emails with booking links
    // For now, update the slots remaining count
    updateCampaignData({
      slotsRemaining: campaignData?.availableSlots?.length
    });
  };

  // Handle campaign launch (full launch)
  const handleLaunchCampaign = async () => {
    // Create beta program if not exists
    let betaProgramId = savedCampaignId;
    if (!betaProgramId) {
      const programResult = await campaignCreationService?.createBetaProgram({
        name: campaignData?.name,
        description: campaignData?.description,
        start_date: new Date()?.toISOString()?.split('T')?.[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
      });

      if (!programResult?.success) {
        throw new Error('Failed to create beta program');
      }
      betaProgramId = programResult?.data?.id;
      setSavedCampaignId(betaProgramId);
    }

    // Send remaining unsent communications
    const allPromises = [];

    // Send invitations if not sent
    if (campaignData?.selectedTesters?.length > 0 && !campaignData?.testersInvited) {
      allPromises?.push(handleSendInvitations());
    }

    // Create calendar slots
    if (campaignData?.availableSlots?.length > 0) {
      const slotData = {
        slots: campaignData?.availableSlots?.map(slot => ({
          beta_program_id: betaProgramId,
          slot_date: slot?.date,
          start_time: slot?.startTime,
          end_time: slot?.endTime,
          description: `Beta Testing Session - ${campaignData?.name}`,
          meeting_link: `https://meet.google.com/new`,
          capacity: 1
        }))
      };

      allPromises?.push(campaignCreationService?.createCalendarSlots(slotData));
    }

    await Promise.all(allPromises);

    setCampaignState('launched');
    updateCampaignData({ betaProgramId });

    // Navigate to dashboard with success message
    navigate('/dashboard', {
      state: {
        message: `Campaign "${campaignData?.name}" launched successfully!`,
        type: 'success'
      }
    });
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);

      const programResult = await campaignCreationService?.createBetaProgram({
        name: `${campaignData?.name} (Draft)`,
        description: campaignData?.description,
        start_date: null,
        end_date: null,
        is_active: false
      });

      if (!programResult?.success) {
        throw new Error('Failed to save draft');
      }

      setSavedCampaignId(programResult?.data?.id);
      updateCampaignData({
        betaProgramId: programResult?.data?.id,
        lastSaved: new Date()?.toISOString()
      });

      navigate('/dashboard', {
        state: {
          message: `Campaign draft "${campaignData?.name}" saved successfully!`,
          type: 'info'
        }
      });
    } catch (error) {
      setError(error?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    const stepProps = {
      data: campaignData,
      updateData: updateCampaignData,
      onSendNow: () => handleSendNow(steps?.[currentStep]?.id),
      campaignState,
      loading
    };

    switch (currentStep) {
      case 0:
        return (
          <InviteTesterStep
            {...stepProps}
          />
        );
      case 1:
        return (
          <NdaWorkflowStep
            {...stepProps}
            selectedTesters={campaignData?.selectedTesters}
          />
        );
      case 2:
        return (
          <ScheduleSlotStep
            {...stepProps}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            {...stepProps}
            onLaunch={handleLaunchCampaign}
            onSaveDraft={handleSaveDraft}
          />
        );
      default:
        return null;
    }
  };

  // Get step completion status
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <LoadingIndicator message="Processing campaign..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Wizard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-foreground">Campaign Creation Wizard</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    campaignState === 'draft' ? 'bg-muted/50 text-muted-foreground'
                    : campaignState === 'in_progress'? 'bg-warning/10 text-warning' :'bg-success/10 text-success'
                  }`}>
                    {campaignState === 'draft' ? 'Draft'
                      : campaignState === 'in_progress'? 'In Progress' :'Launched'}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Create a new beta testing campaign with guided workflow or jump to any step
                </p>
                {campaignData?.lastSaved && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last saved: {new Date(campaignData.lastSaved)?.toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                iconName="X"
                iconPosition="left"
                iconSize={16}
              >
                Cancel
              </Button>
            </div>

            {/* Enhanced Progress Stepper */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                {steps?.map((step, index) => (
                  <React.Fragment key={step?.id}>
                    <div 
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                        getStepStatus(index) === 'current' ? 'opacity-100' : 
                        getStepStatus(index) === 'completed' ? 'opacity-100' : 'opacity-60'
                      }`}
                      onClick={() => handleStepClick(index)}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-200 relative
                        ${getStepStatus(index) === 'current' ?'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg' 
                          : getStepStatus(index) === 'completed' ?'bg-success text-success-foreground shadow-md' :'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}>
                        {getStepStatus(index) === 'completed' ? (
                          <AppIcon name="Check" size={18} />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="text-center max-w-28">
                        <div className={`text-sm font-medium mb-1 ${
                          getStepStatus(index) !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step?.label}
                        </div>
                        
                        {/* Progress Metrics */}
                        {step?.progress?.total > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {step?.progress?.completed}/{step?.progress?.total}
                            {step?.progress?.pending > 0 && (
                              <span className="text-warning ml-1">
                                ({step?.progress?.pending} pending)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < steps?.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                        getStepStatus(index) === 'completed' ? 'bg-success' : 'bg-muted'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Direct Step Access */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs text-muted-foreground">Quick access:</span>
                  {steps?.map((step, index) => (
                    <button
                      key={step?.id}
                      onClick={() => handleStepClick(index)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        index === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {step?.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AppIcon name="AlertCircle" size={16} className="text-destructive" />
                <span className="text-sm text-destructive font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive hover:text-destructive/80"
                >
                  <AppIcon name="X" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {steps?.[currentStep]?.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {steps?.[currentStep]?.description}
                  </p>
                </div>
                
                {/* Step-specific progress indicator */}
                {steps?.[currentStep]?.progress?.total > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      Progress: {steps?.[currentStep]?.progress?.completed}/{steps?.[currentStep]?.progress?.total}
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full mt-1">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(steps?.[currentStep]?.progress?.completed / steps?.[currentStep]?.progress?.total) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {renderStepContent()}
          </div>

          {/* Enhanced Navigation Footer */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              iconName="ChevronLeft"
              iconPosition="left"
              iconSize={16}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-3">
              {/* Save & Continue vs Send Now actions */}
              {currentStep < 3 ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleSaveDraft}
                    iconName="Save"
                    iconPosition="left"
                    iconSize={16}
                    disabled={loading}
                  >
                    Save & Continue
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSendNow(steps?.[currentStep]?.id)}
                    // disabled={loading}
                    disabled
                    className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                    iconName="Send"
                    iconPosition="left"
                    iconSize={16}
                  >
                    {currentStep === 0 ? 'Send Invitations Now'
                      : currentStep === 1 ? 'Send NDA Now'
                      : currentStep === 2 ? 'Send Scheduling Email Now' :'Send Now'}
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    iconName="ChevronRight"
                    iconPosition="right"
                    iconSize={16}
                  >
                    Next Step
                  </Button>
                </>
              ) : (
                /* Final step actions */
                (<>
                  <Button
                    variant="ghost"
                    onClick={handleSaveDraft}
                    iconName="Save"
                    iconPosition="left"
                    iconSize={16}
                    disabled={loading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={handleLaunchCampaign}
                    disabled={loading}
                    iconName="Rocket"
                    iconPosition="left"
                    iconSize={16}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    Launch Campaign
                  </Button>
                </>)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignCreationWizard;