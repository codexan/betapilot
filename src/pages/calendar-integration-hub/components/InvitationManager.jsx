import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import Button from '../../../components/ui/Button';

import calendarIntegrationService from '../../../services/calendarIntegrationService';

const InvitationManager = ({ invitations = [], onInvitationsChange }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [betaPrograms, setBetaPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStep, setFilterStep] = useState('all');

  const [newInvitation, setNewInvitation] = useState({
    beta_program_id: '',
    customer_id: '',
    email_template_id: '',
    custom_message: ''
  });

  useEffect(() => {
    loadSupportingData();
  }, []);

  const loadSupportingData = async () => {
    try {
      const [templates] = await Promise.all([
        calendarIntegrationService?.getEmailTemplates()
      ]);

      setEmailTemplates(templates);
      
      // Mock data for customers and beta programs
      setCustomers([
        { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@google.com' },
        { id: '2', first_name: 'Michael', last_name: 'Chen', email: 'm.chen@microsoft.com' },
        { id: '3', first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@startup.com' }
      ]);

      setBetaPrograms([
        { id: '1', name: 'PilotBeta v2.0 Beta Program' },
        { id: '2', name: 'Mobile App Beta' },
        { id: '3', name: 'Website Redesign Beta' }
      ]);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  };

  const handleCreateInvitation = async (e) => {
    e?.preventDefault();
    
    if (!newInvitation?.beta_program_id || !newInvitation?.customer_id) {
      alert('Please select both a beta program and customer');
      return;
    }

    try {
      setLoading(true);
      await calendarIntegrationService?.createBetaInvitation(newInvitation);
      
      // Refresh invitations
      const updatedInvitations = await calendarIntegrationService?.getBetaInvitations();
      onInvitationsChange?.(updatedInvitations);
      
      // Reset form
      setNewInvitation({
        beta_program_id: '',
        customer_id: '',
        email_template_id: '',
        custom_message: ''
      });
      
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 'invitation_sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'invitation_accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'nda_sent':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'nda_signed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'calendar_sent':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'slot_booked':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'session_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStepColor = (step) => {
    switch (step) {
      case 'invitation_sent':
        return 'bg-blue-100 text-blue-800';
      case 'invitation_accepted':
        return 'bg-green-100 text-green-800';
      case 'nda_sent':
        return 'bg-orange-100 text-orange-800';
      case 'nda_signed':
        return 'bg-green-100 text-green-800';
      case 'calendar_sent':
        return 'bg-purple-100 text-purple-800';
      case 'slot_booked':
        return 'bg-blue-100 text-blue-800';
      case 'session_completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvitations = invitations?.filter(invitation => {
    if (filterStep === 'all') return true;
    return invitation?.current_step === filterStep;
  }) || [];

  const workflowSteps = [
    { value: 'all', label: 'All Steps' },
    { value: 'invitation_sent', label: 'Invitation Sent' },
    { value: 'invitation_accepted', label: 'Invitation Accepted' },
    { value: 'nda_sent', label: 'NDA Sent' },
    { value: 'nda_signed', label: 'NDA Signed' },
    { value: 'calendar_sent', label: 'Calendar Sent' },
    { value: 'slot_booked', label: 'Slot Booked' },
    { value: 'session_completed', label: 'Session Completed' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beta Invitations</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Send Invitation
        </Button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by workflow step:</label>
          <select
            value={filterStep}
            onChange={(e) => setFilterStep(e?.target?.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {workflowSteps?.map(step => (
              <option key={step?.value} value={step?.value}>
                {step?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Invitations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invitations</h3>
          
          {filteredInvitations?.length > 0 ? (
            <div className="space-y-4">
              {filteredInvitations?.map((invitation) => (
                <div key={invitation?.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(invitation?.current_step)}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {invitation?.customers?.first_name} {invitation?.customers?.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{invitation?.customers?.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invitation?.beta_programs?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(invitation?.created_at)?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStepColor(invitation?.current_step)}`}>
                        {invitation?.current_step?.replace('_', ' ')?.toUpperCase()}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('View invitation details:', invitation?.id);
                          // Handle view details
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-4 pl-8">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Progress:</span>
                      <div className="flex items-center space-x-1">
                        {['invitation_sent', 'invitation_accepted', 'nda_signed', 'slot_booked', 'session_completed']?.map((step, index) => {
                          const isCompleted = ['invitation_sent', 'invitation_accepted', 'nda_signed', 'slot_booked']?.includes(invitation?.current_step) || 
                                            invitation?.current_step === 'session_completed';
                          const isCurrent = invitation?.current_step === step;
                          
                          return (
                            <div
                              key={step}
                              className={`w-2 h-2 rounded-full ${
                                isCurrent ? 'bg-blue-500' : 
                                isCompleted ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
              <p className="text-gray-500 mb-6">
                {filterStep === 'all' ?'Get started by sending your first beta invitation.'
                  : `No invitations found for "${workflowSteps?.find(s => s?.value === filterStep)?.label}".`
                }
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Create Invitation Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Send Beta Invitation</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beta Program *
                </label>
                <select
                  value={newInvitation?.beta_program_id}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, beta_program_id: e?.target?.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a beta program</option>
                  {betaPrograms?.map(program => (
                    <option key={program?.id} value={program?.id}>
                      {program?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  value={newInvitation?.customer_id}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, customer_id: e?.target?.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers?.map(customer => (
                    <option key={customer?.id} value={customer?.id}>
                      {customer?.first_name} {customer?.last_name} ({customer?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Template
                </label>
                <select
                  value={newInvitation?.email_template_id}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, email_template_id: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Use default template</option>
                  {emailTemplates?.filter(t => t?.template_type === 'invitation')?.map(template => (
                    <option key={template?.id} value={template?.id}>
                      {template?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={newInvitation?.custom_message}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, custom_message: e?.target?.value }))}
                  rows={3}
                  placeholder="Add a personal message to the invitation email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationManager;