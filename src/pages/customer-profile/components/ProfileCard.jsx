import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProfileCard = ({ customer, onSave, onSendEmail, onAddToBeta }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(customer);

  const regionOptions = [
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia Pacific' },
    { value: 'latin-america', label: 'Latin America' },
    { value: 'middle-east-africa', label: 'Middle East & Africa' }
  ];

  const timezoneOptions = [
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' },
    { value: 'JST', label: 'Japan Standard Time (JST)' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'japanese', label: 'Japanese' }
  ];

  const segmentOptions = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'startup', label: 'Startup' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'early-adopter', label: 'Early Adopter' }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(customer);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {customer?.firstName} {customer?.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{customer?.email}</p>
          </div>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={handleEdit} iconName="Edit" iconPosition="left">
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={editData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                required
              />
              <Input
                label="Last Name"
                value={editData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={editData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              required
            />
            
            <Input
              label="Organization"
              value={editData?.organization}
              onChange={(e) => handleInputChange('organization', e?.target?.value)}
            />
            
            <Input
              label="Job Title"
              value={editData?.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e?.target?.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Region"
                options={regionOptions}
                value={editData?.region}
                onChange={(value) => handleInputChange('region', value)}
              />
              <Select
                label="Time Zone"
                options={timezoneOptions}
                value={editData?.timezone}
                onChange={(value) => handleInputChange('timezone', value)}
              />
            </div>
            
            <Select
              label="Language"
              options={languageOptions}
              value={editData?.language}
              onChange={(value) => handleInputChange('language', value)}
            />
            
            <Select
              label="Segment Tags"
              options={segmentOptions}
              value={editData?.segments}
              onChange={(value) => handleInputChange('segments', value)}
              multiple
              searchable
            />

            <div className="flex space-x-3 pt-4">
              <Button variant="default" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Organization:</span>
                <p className="text-foreground font-medium">{customer?.organization}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Job Title:</span>
                <p className="text-foreground font-medium">{customer?.jobTitle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Region:</span>
                <p className="text-foreground font-medium">{customer?.region}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time Zone:</span>
                <p className="text-foreground font-medium">{customer?.timezone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Language:</span>
                <p className="text-foreground font-medium">{customer?.language}</p>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground text-sm">Segment Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {customer?.segments?.map((segment, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md border border-accent/20"
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* <Button  variant="default" onClick={onSendEmail} iconName="Mail" iconPosition="left">
                Send Email
              </Button> */}
              <Button
                variant="default"
                disabled
                iconName="Mail"
                iconPosition="left"
                className="cursor-not-allowed opacity-50"
              >
                Send Email
              </Button>

              <Button disabled variant="outline" onClick={onAddToBeta} iconName="Plus" iconPosition="left" className="cursor-not-allowed opacity-50">
                Add to Beta
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;