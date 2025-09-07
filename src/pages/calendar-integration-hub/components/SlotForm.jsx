import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SlotForm = ({ 
  slot = null, 
  calendarIntegrations = [], 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    calendar_integration_id: '',
    beta_program_id: '',
    start_time: '',
    end_time: '',
    capacity: 1,
    status: 'available',
    notes: ''
  });

  const [betaPrograms, setBetaPrograms] = useState([]);

  useEffect(() => {
    // Load beta programs
    loadBetaPrograms();
    
    if (slot) {
      setFormData({
        calendar_integration_id: slot?.calendar_integration_id || '',
        beta_program_id: slot?.beta_program_id || '',
        start_time: slot?.start_time ? new Date(slot.start_time)?.toISOString()?.slice(0, 16) : '',
        end_time: slot?.end_time ? new Date(slot.end_time)?.toISOString()?.slice(0, 16) : '',
        capacity: slot?.capacity || 1,
        status: slot?.status || 'available',
        notes: slot?.notes || ''
      });
    }
  }, [slot]);

  const loadBetaPrograms = async () => {
    try {
      // This would typically come from a beta programs service
      // For now, we'll use mock data
      setBetaPrograms([
        { id: '1', name: 'BetaPilot v2.0 Beta Program' },
        { id: '2', name: 'Mobile App Beta' },
        { id: '3', name: 'Website Redesign Beta' }
      ]);
    } catch (error) {
      console.error('Error loading beta programs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    // Validate required fields
    if (!formData?.start_time || !formData?.end_time) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate start time is before end time
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      alert('Start time must be before end time');
      return;
    }

    onSave?.(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {slot ? 'Edit Time Slot' : 'Add New Time Slot'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calendar Integration
              </label>
              <select
                name="calendar_integration_id"
                value={formData?.calendar_integration_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Calendar</option>
                {calendarIntegrations?.map(integration => (
                  <option key={integration?.id} value={integration?.id}>
                    {integration?.provider} - {integration?.provider_calendar_id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beta Program
              </label>
              <select
                name="beta_program_id"
                value={formData?.beta_program_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Program</option>
                {betaPrograms?.map(program => (
                  <option key={program?.id} value={program?.id}>
                    {program?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                name="start_time"
                value={formData?.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <Input
                type="datetime-local"
                name="end_time"
                value={formData?.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData?.capacity}
                onChange={handleChange}
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData?.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData?.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes about this time slot..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Saving...' : (slot ? 'Update Slot' : 'Create Slot')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotForm;