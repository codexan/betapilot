import React from 'react';
import Input from '../../../components/ui/Input';
import Checkbox from '../../../components/ui/Checkbox';

const WorkflowMetadata = ({ 
  workflowName, 
  setWorkflowName, 
  workflowDescription, 
  setWorkflowDescription, 
  isActive, 
  setIsActive 
}) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Workflow Details</h3>
      <div className="space-y-4">
        <Input
          label="Workflow Name"
          type="text"
          placeholder="Enter workflow name (e.g., New Beta Tester Onboarding)"
          value={workflowName}
          onChange={(e) => setWorkflowName(e?.target?.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows="3"
            placeholder="Describe what this workflow does and when it should be used..."
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e?.target?.value)}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <Checkbox
              label="Activate workflow immediately"
              description="Start using this workflow as soon as it's saved"
              checked={isActive}
              onChange={(e) => setIsActive(e?.target?.checked)}
            />
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowMetadata;