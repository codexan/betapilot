import React, { useState, useEffect } from 'react';
import { Plus, Clock, Edit, Trash2, Calendar, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import SlotForm from './SlotForm';
import calendarIntegrationService from '../../../services/calendarIntegrationService';

const SlotManagementPanel = ({ slots = [], onSlotsChange, calendarIntegrations = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredSlots = slots?.filter(slot => {
    const matchesDate = !filterDate || slot?.start_time?.includes(filterDate);
    const matchesStatus = filterStatus === 'all' || slot?.status === filterStatus;
    return matchesDate && matchesStatus;
  }) || [];

  const handleCreateSlot = async (slotData) => {
    try {
      setLoading(true);
      const newSlot = await calendarIntegrationService?.createCalendarSlot(slotData);
      const updatedSlots = await calendarIntegrationService?.getCalendarSlots();
      onSlotsChange?.(updatedSlots);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating slot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = async (slotId, updates) => {
    try {
      setLoading(true);
      await calendarIntegrationService?.updateCalendarSlot(slotId, updates);
      const updatedSlots = await calendarIntegrationService?.getCalendarSlots();
      onSlotsChange?.(updatedSlots);
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating slot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        setLoading(true);
        await calendarIntegrationService?.deleteCalendarSlot(slotId);
        const updatedSlots = await calendarIntegrationService?.getCalendarSlots();
        onSlotsChange?.(updatedSlots);
      } catch (error) {
        console.error('Error deleting slot:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return `${date?.toLocaleDateString()} ${date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slot Management</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Time Slot
        </Button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e?.target?.value)}
              placeholder="Select date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Integration</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="">All Calendars</option>
              {calendarIntegrations?.map(integration => (
                <option key={integration?.id} value={integration?.id}>
                  {integration?.provider} - {integration?.provider_calendar_id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Slots Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Slots</h3>
          
          {filteredSlots?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beta Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calendar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlots?.map((slot) => (
                    <tr key={slot?.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateTime(slot?.start_time)}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {formatDateTime(slot?.end_time)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {slot?.beta_programs?.name || 'No program'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="w-4 h-4 text-gray-400 mr-1" />
                          {slot?.booked_count || 0} / {slot?.capacity || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(slot?.status)}`}>
                          {slot?.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {slot?.calendar_integrations?.provider || 'Manual'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSlot(slot)}
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSlot(slot?.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first time slot.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center mx-auto"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Add/Edit Slot Form Modal */}
      {(showForm || editingSlot) && (
        <SlotForm
          slot={editingSlot}
          calendarIntegrations={calendarIntegrations}
          onSave={editingSlot ? 
            (updates) => handleEditSlot(editingSlot?.id, updates) : 
            handleCreateSlot
          }
          onCancel={() => {
            setShowForm(false);
            setEditingSlot(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SlotManagementPanel;