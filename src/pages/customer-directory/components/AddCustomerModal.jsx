import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { createCustomer } from '../../../services/customerService';

const AddCustomerModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    jobTitle: '',
    region: '',
    timeZone: '',
    language: 'English',
    participationStatus: 'active',
    segments: [],
    deviceInfo: '',
    osInfo: '',
    browserInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const organizationOptions = [
    { value: 'google', label: 'Google Inc.' },
    { value: 'microsoft', label: 'Microsoft Corporation' },
    { value: 'apple', label: 'Apple Inc.' },
    { value: 'amazon', label: 'Amazon Web Services' },
    { value: 'meta', label: 'Meta Platforms' },
    { value: 'netflix', label: 'Netflix Inc.' },
    { value: 'uber', label: 'Uber Technologies' },
    { value: 'airbnb', label: 'Airbnb Inc.' },
    { value: 'other', label: 'Other' },
  ];

  const participationStatusOptions = [
    { value: 'invited', label: 'Invited' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' },
    { value: 'paused', label: 'Paused' },
  ];

  const regionOptions = [
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
  ];

  const timeZoneOptions = [
    { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
    { value: 'UTC-7', label: 'Mountain Time (UTC-7)' },
    { value: 'UTC-6', label: 'Central Time (UTC-6)' },
    { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
    { value: 'UTC+0', label: 'GMT (UTC+0)' },
    { value: 'UTC+1', label: 'Central European Time (UTC+1)' },
    { value: 'UTC+8', label: 'China Standard Time (UTC+8)' },
    { value: 'UTC+9', label: 'Japan Standard Time (UTC+9)' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
  ];

  const segmentOptions = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'startup', label: 'Startup' },
    { value: 'individual', label: 'Individual' },
    { value: 'academic', label: 'Academic' },
    { value: 'government', label: 'Government' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // More robust validation for first_name
    if (!formData?.firstName || !formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // More robust validation for last_name  
    if (!formData?.lastName || !formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // More robust validation for email
    if (!formData?.email || !formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email?.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Organization validation - ensure not empty
    if (!formData?.organization || formData?.organization === '') {
      newErrors.organization = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Sanitize form data before sending - ensure no empty strings for required fields
      const sanitizedData = {
        firstName: formData?.firstName?.trim(),
        lastName: formData?.lastName?.trim(), 
        email: formData?.email?.trim(),
        organization: formData?.organization,
        jobTitle: formData?.jobTitle?.trim() || null,
        region: formData?.region || null,
        timeZone: formData?.timeZone || null,
        language: formData?.language || 'English',
        participationStatus: formData?.participationStatus || 'active',
        segments: formData?.segments || [],
        deviceInfo: formData?.deviceInfo?.trim() || null,
        osInfo: formData?.osInfo?.trim() || null,
        browserInfo: formData?.browserInfo?.trim() || null,
        notes: formData?.notes?.trim() || null
      };

      // Additional validation - ensure required fields are not empty after sanitization
      if (!sanitizedData?.firstName || !sanitizedData?.lastName || !sanitizedData?.email) {
        setErrors({ submit: 'Please fill in all required fields (First Name, Last Name, Email)' });
        return;
      }

      // Use Supabase service to create customer
      const { data, error } = await createCustomer(sanitizedData);
      
      if (error) {
        // Handle specific database constraint errors
        if (error?.includes('null value in column') || error?.includes('violates not-null constraint')) {
          setErrors({ submit: 'Required fields cannot be empty. Please check First Name, Last Name, and Email fields.' });
        } else if (error?.includes('duplicate key value') || error?.includes('already exists')) {
          setErrors({ submit: 'A customer with this email already exists. Please use a different email address.' });
        } else {
          setErrors({ submit: `Error creating customer: ${error}` });
        }
        return;
      }
      
      // Call parent handler and close modal
      onSave?.(data);
      onClose?.();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        jobTitle: '',
        region: '',
        timeZone: '',
        language: 'English',
        participationStatus: 'active',
        segments: [],
        deviceInfo: '',
        osInfo: '',
        browserInfo: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to create customer. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add New Customer</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {errors?.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{errors?.submit}</p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  required
                  value={formData?.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                  error={errors?.firstName}
                  placeholder="Enter first name"
                />
                
                <Input
                  label="Last Name"
                  type="text"
                  required
                  value={formData?.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                  error={errors?.lastName}
                  placeholder="Enter last name"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                required
                value={formData?.email || ''}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                placeholder="Enter email address"
                description="This email must be unique in the system"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Organization"
                  required
                  options={organizationOptions}
                  value={formData?.organization || ''}
                  onChange={(value) => handleInputChange('organization', value)}
                  error={errors?.organization}
                  placeholder="Select organization"
                  searchable
                />

                <Input
                  label="Job Title (Optional)"
                  type="text"
                  value={formData?.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e?.target?.value)}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            {/* Participation Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Participation Status</h3>
              
              <Select
                label="Current Status"
                options={participationStatusOptions}
                value={formData?.participationStatus}
                onChange={(value) => handleInputChange('participationStatus', value)}
                placeholder="Select participation status"
                description="Set the customer's current beta program participation status"
              />
            </div>

            {/* Location & Language */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Location & Language</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Region (Optional)"
                  options={regionOptions}
                  value={formData?.region || ''}
                  onChange={(value) => handleInputChange('region', value)}
                  placeholder="Select region (optional)"
                />

                <Select
                  label="Time Zone"
                  options={timeZoneOptions}
                  value={formData?.timeZone}
                  onChange={(value) => handleInputChange('timeZone', value)}
                  placeholder="Select time zone"
                />
              </div>

              <Select
                label="Language"
                options={languageOptions}
                value={formData?.language}
                onChange={(value) => handleInputChange('language', value)}
                placeholder="Select language"
              />
            </div>

            {/* Segmentation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Segmentation</h3>
              
              <Select
                label="Customer Segments"
                options={segmentOptions}
                value={formData?.segments}
                onChange={(value) => handleInputChange('segments', value)}
                multiple
                searchable
                placeholder="Select customer segments"
                description="Choose relevant segments based on organization type and use case"
              />
            </div>

            {/* Device Information (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Device Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Device"
                  type="text"
                  value={formData?.deviceInfo}
                  onChange={(e) => handleInputChange('deviceInfo', e?.target?.value)}
                  placeholder="e.g., iPhone 15 Pro"
                />

                <Input
                  label="Operating System"
                  type="text"
                  value={formData?.osInfo}
                  onChange={(e) => handleInputChange('osInfo', e?.target?.value)}
                  placeholder="e.g., iOS 17.1"
                />

                <Input
                  label="Browser"
                  type="text"
                  value={formData?.browserInfo}
                  onChange={(e) => handleInputChange('browserInfo', e?.target?.value)}
                  placeholder="e.g., Safari 17"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="Plus"
              iconPosition="left"
            >
              Add Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;