import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const TemplateActions = ({ template, onSave, onSendTest, onDuplicate, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(template);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Actions */}
      <div className="text-xs text-muted-foreground">
        Template: <span className="font-medium text-foreground">{template?.name}</span>
      </div>
      
      {/* Status Badge */}
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        template?.is_active 
          ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
      }`}>
        {template?.is_active ? 'Active' : 'Draft'}
      </div>

      {/* Usage Count */}
      <div className="text-xs text-muted-foreground">
        {template?.usage_count || 0} uses
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        iconName="Trash2"
        className="text-destructive hover:text-destructive"
        onClick={() => setShowDeleteConfirm(true)}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Delete Template</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{template?.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateActions;