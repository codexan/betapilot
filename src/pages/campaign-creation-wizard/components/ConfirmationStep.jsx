import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import AppIcon from '../../../components/AppIcon';

const ConfirmationStep = ({ data, updateData, onLaunch, onSaveDraft, loading, campaignState }) => {
  const [calendarSync, setCalendarSync] = useState('google'); // google, outlook
  const [autoZoomLinks, setAutoZoomLinks] = useState(true);

  // Calculate summary statistics
  const selectedTestersCount = data?.selectedTesters?.length || 0;
  const ndaCount = data?.ndaEnabled ? selectedTestersCount : 0;
  const slotsCount = data?.availableSlots?.length || 0;

  // Group slots by date for display
  const slotsByDate = (data?.availableSlots || [])?.reduce((acc, slot) => {
    if (!acc?.[slot?.date]) {
      acc[slot.date] = [];
    }
    acc?.[slot?.date]?.push(slot);
    return acc;
  }, {});

  const handleLaunchCampaign = () => {
    onLaunch?.();
  };

  const handleSaveDraft = () => {
    onSaveDraft?.();
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingIndicator message="Launching your campaign..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Campaign Summary Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{data?.name || 'Untitled Campaign'}</h3>
            <p className="text-muted-foreground">{data?.description || 'No description provided'}</p>
          </div>
          <div className="bg-primary/20 rounded-full p-3">
            <AppIcon name="Rocket" size={24} className="text-primary" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{selectedTestersCount}</div>
            <div className="text-xs text-muted-foreground">Beta Testers</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{ndaCount}</div>
            <div className="text-xs text-muted-foreground">NDAs Required</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{slotsCount}</div>
            <div className="text-xs text-muted-foreground">Time Slots</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">{Object.keys(slotsByDate)?.length}</div>
            <div className="text-xs text-muted-foreground">Testing Days</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Launch Actions */}
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-medium text-foreground mb-2">Launch Campaign</h4>
            <p className="text-sm text-muted-foreground">
              Review your campaign settings and launch when ready. This will trigger all remaining unsent communications and activate automation.
            </p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            campaignState === 'draft' ? 'bg-muted/50 text-muted-foreground'
            : campaignState === 'in_progress'? 'bg-warning/10 text-warning' :'bg-success/10 text-success'
          }`}>
            {campaignState === 'draft' ? 'Draft'
              : campaignState === 'in_progress'? 'In Progress' :'Launched'}
          </div>
        </div>

        {/* Campaign Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Testers</span>
              <AppIcon name="Users" size={16} className="text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground">
              {data?.selectedTesters?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {data?.testersInvited || 0} invited
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">NDAs</span>
              <AppIcon name="FileText" size={16} className="text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground">
              {data?.ndasSent || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {data?.ndasSigned || 0} signed
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Time Slots</span>
              <AppIcon name="Calendar" size={16} className="text-primary" />
            </div>
            <div className="text-lg font-semibold text-foreground">
              {data?.availableSlots?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {data?.slotsFilled || 0} booked
            </div>
          </div>
        </div>

        {/* Calendar Integration Status */}
        <div className="bg-muted/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <AppIcon name="Calendar" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Calendar Integration</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sync with Outlook/Google Calendar for seamless scheduling
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <AppIcon name="ExternalLink" size={14} className="mr-2" />
                Connect Outlook
              </Button>
              <Button variant="outline" size="sm">
                <AppIcon name="ExternalLink" size={14} className="mr-2" />
                Connect Google
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onSaveDraft}
              disabled={loading}
              iconName="Save"
              iconPosition="left"
              iconSize={16}
            >
              Save as Draft
            </Button>
            
            {/* Optional: Send Confirmation Emails */}
            <Button
              variant="outline"
              disabled={loading || !data?.selectedTesters?.length}
              className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              iconName="Mail"
              iconPosition="left"
              iconSize={16}
            >
              Send Confirmation Emails
            </Button>
          </div>
          
          <Button
            onClick={onLaunch}
            disabled={loading || !data?.selectedTesters?.length}
            size="lg"
            className="bg-success text-success-foreground hover:bg-success/90 px-8"
            iconName="Rocket"
            iconPosition="left"
            iconSize={18}
          >
            {loading ? 'Launching...' : 'Launch Campaign'}
          </Button>
        </div>

        {/* Launch Checklist */}
        <div className="mt-6 pt-4 border-t border-border">
          <h5 className="text-sm font-medium text-foreground mb-3">Pre-Launch Checklist</h5>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <AppIcon 
                name={data?.selectedTesters?.length > 0 ? "CheckCircle" : "Circle"} 
                size={14} 
                className={data?.selectedTesters?.length > 0 ? "text-success" : "text-muted-foreground"} 
              />
              <span className={data?.selectedTesters?.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                Testers selected ({data?.selectedTesters?.length || 0})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AppIcon 
                name={data?.emailSubject ? "CheckCircle" : "Circle"} 
                size={14} 
                className={data?.emailSubject ? "text-success" : "text-muted-foreground"} 
              />
              <span className={data?.emailSubject ? "text-foreground" : "text-muted-foreground"}>
                Email template configured
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AppIcon 
                name={data?.ndaTemplate ? "CheckCircle" : "Circle"} 
                size={14} 
                className={data?.ndaTemplate ? "text-success" : "text-muted-foreground"} 
              />
              <span className={data?.ndaTemplate ? "text-foreground" : "text-muted-foreground"}>
                NDA workflow ready
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AppIcon 
                name={data?.availableSlots?.length > 0 ? "CheckCircle" : "Circle"} 
                size={14} 
                className={data?.availableSlots?.length > 0 ? "text-success" : "text-muted-foreground"} 
              />
              <span className={data?.availableSlots?.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                Schedule slots defined ({data?.availableSlots?.length || 0})
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Launch Warning */}
      {selectedTestersCount === 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AppIcon name="AlertTriangle" size={16} className="text-warning" />
            <div>
              <h4 className="text-sm font-medium text-foreground">Cannot Launch Campaign</h4>
              <p className="text-xs text-muted-foreground">
                Please return to Step 1 and select at least one beta tester before launching your campaign.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Success Info */}
      {selectedTestersCount > 0 && (
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AppIcon name="Info" size={16} className="text-info mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">What happens after launch?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Invitation emails will be sent to all selected testers</li>
                {data?.ndaEnabled && <li>• NDAs will be sent for signature before beta access</li>}
                <li>• Testers can book available time slots for their sessions</li>
                <li>• Calendar invites and Zoom links will be automatically generated</li>
                <li>• You'll receive notifications for all bookings and NDA signatures</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationStep;