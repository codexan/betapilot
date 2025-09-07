import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, Mail, ExternalLink, RotateCw, BarChart3, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import CalendarConnectionCard from './components/CalendarConnectionCard';
import SlotManagementPanel from './components/SlotManagementPanel';
import BookingLinkGenerator from './components/BookingLinkGenerator';
import WorkflowStatsCard from './components/WorkflowStatsCard';
import InvitationManager from './components/InvitationManager';
import calendarIntegrationService from '../../services/calendarIntegrationService';

const CalendarIntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [calendarIntegrations, setCalendarIntegrations] = useState([]);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [workflowStats, setWorkflowStats] = useState({});
  const [utilizationStats, setUtilizationStats] = useState({});
  const [betaInvitations, setBetaInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [integrations, slots, stats, utilization, invitations] = await Promise.all([
        calendarIntegrationService?.getCalendarIntegrations(),
        calendarIntegrationService?.getCalendarSlots(),
        calendarIntegrationService?.getWorkflowStats(),
        calendarIntegrationService?.getSlotUtilizationStats(),
        calendarIntegrationService?.getBetaInvitations()
      ]);

      setCalendarIntegrations(integrations);
      setCalendarSlots(slots);
      setWorkflowStats(stats);
      setUtilizationStats(utilization);
      setBetaInvitations(invitations);
    } catch (error) {
      console.error('Error loading calendar integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendars = async () => {
    try {
      setSyncStatus('syncing');
      // Simulate calendar sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadInitialData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations', icon: Settings },
    { id: 'slots', label: 'Slot Management', icon: Clock },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'bookings', label: 'Booking Links', icon: ExternalLink }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <WorkflowStatsCard 
                title="Total Invitations"
                value={Object.values(workflowStats)?.reduce((sum, count) => sum + count, 0)}
                icon={Mail}
                trend="+12%"
              />
              <WorkflowStatsCard 
                title="Active Slots"
                value={utilizationStats?.availableSlots || 0}
                icon={Clock}
                trend="+5%"
              />
              <WorkflowStatsCard 
                title="Completion Rate"
                value={`${Math.round(utilizationStats?.utilizationRate || 0)}%`}
                icon={CheckCircle}
                trend="+8%"
              />
              <WorkflowStatsCard 
                title="Connected Calendars"
                value={calendarIntegrations?.filter(ci => ci?.is_active)?.length || 0}
                icon={Calendar}
                trend="stable"
              />
            </div>
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setActiveTab('integrations')}
                  variant="outline"
                  className="flex items-center justify-center p-4"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Connect Calendar
                </Button>
                <Button
                  onClick={() => setActiveTab('slots')}
                  variant="outline"
                  className="flex items-center justify-center p-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Time Slots
                </Button>
                <Button 
                  onClick={() => setActiveTab('invitations')}
                  variant="outline"
                  className="flex items-center justify-center p-4"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Invitation (coming soon)
                </Button>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Beta Invitations</h3>
              <div className="space-y-3">
                {betaInvitations?.slice(0, 5)?.map(invitation => (
                  <div key={invitation?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">
                          {invitation?.customers?.first_name} {invitation?.customers?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{invitation?.customers?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">
                        {invitation?.current_step?.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invitation?.beta_programs?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Calendar Integrations</h2>
              <Button
                onClick={handleSyncCalendars}
                disabled={syncStatus === 'syncing'}
                className="flex items-center"
              >
                <RotateCw className={`w-4 h-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Calendars'}
              </Button>
            </div>

            {syncStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">Calendars synchronized successfully!</span>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800">Failed to sync calendars. Please try again.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CalendarConnectionCard
                provider="google"
                connected={calendarIntegrations?.some(ci => ci?.provider === 'google' && ci?.is_active)}
                onConnect={(provider) => {
                  console.log('Connect', provider);
                  // Handle calendar connection
                }}
                onDisconnect={(provider) => {
                  console.log('Disconnect', provider);
                  // Handle calendar disconnection
                }}
              />
              <CalendarConnectionCard
                provider="outlook"
                connected={calendarIntegrations?.some(ci => ci?.provider === 'outlook' && ci?.is_active)}
                onConnect={(provider) => {
                  console.log('Connect', provider);
                  // Handle calendar connection
                }}
                onDisconnect={(provider) => {
                  console.log('Disconnect', provider);
                  // Handle calendar disconnection
                }}
              />
              <CalendarConnectionCard
                provider="manual"
                connected={true}
                onConnect={() => {}}
                onDisconnect={() => {}}
                isManual={true}
              />
            </div>
          </div>
        );

      case 'slots':
        return (
          <SlotManagementPanel
            slots={calendarSlots}
            onSlotsChange={setCalendarSlots}
            calendarIntegrations={calendarIntegrations}
          />
        );

      case 'invitations':
        return (
          <InvitationManager
            invitations={betaInvitations}
            onInvitationsChange={setBetaInvitations}
          />
        );

      case 'bookings':
        return (
          <BookingLinkGenerator
            calendarSlots={calendarSlots}
            calendarIntegrations={calendarIntegrations}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Integration Hub</h1>
          <p className="text-gray-600">
            Manage calendar integrations, slot availability, and beta testing workflows
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab?.id
                      ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CalendarIntegrationHub;