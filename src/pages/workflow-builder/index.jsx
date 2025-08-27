import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import TriggerSelector from './components/TriggerSelector';
import ActionConfigurator from './components/ActionConfigurator';
import WorkflowPreview from './components/WorkflowPreview';
import WorkflowMetadata from './components/WorkflowMetadata';
import WorkflowList from './components/WorkflowList';

const WorkflowBuilder = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'builder'
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // For mobile wizard

  const steps = ['Trigger', 'Actions', 'Preview'];

  const handleCreateNew = () => {
    setCurrentView('builder');
    // Reset form
    setSelectedTrigger(null);
    setSelectedActions([]);
    setWorkflowName('');
    setWorkflowDescription('');
    setIsActive(false);
    setActiveStep(0);
  };

  const handleEditWorkflow = (workflow) => {
    setCurrentView('builder');
    setWorkflowName(workflow?.name);
    setWorkflowDescription(workflow?.description);
    setIsActive(workflow?.isActive);
    // Set mock trigger and actions based on workflow data
    setSelectedTrigger({
      id: 'tester-invited',
      name: workflow?.trigger,
      icon: 'UserPlus'
    });
    setSelectedActions([
      {
        id: 1,
        type: 'send-email',
        template: 'welcome-beta',
        delay: 0,
        delayUnit: 'minutes',
        recipients: 'all',
        order: 1
      }
    ]);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName?.trim() || !selectedTrigger || selectedActions?.length === 0) {
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    setCurrentView('list');
  };

  const handleCancel = () => {
    setCurrentView('list');
  };

  const canSave = workflowName?.trim() && selectedTrigger && selectedActions?.length > 0;

  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Breadcrumb />
            <WorkflowList 
              onCreateNew={handleCreateNew}
              onEditWorkflow={handleEditWorkflow}
            />
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
          <Breadcrumb items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Workflows', path: '/workflow-builder' },
            { label: 'Create Workflow', path: '/workflow-builder/create' }
          ]} />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Workflow Builder</h1>
              <p className="text-muted-foreground">Create automated communication sequences for your beta testing campaigns</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveWorkflow}
                disabled={!canSave}
                loading={isSaving}
                iconName="Save"
                iconPosition="left"
              >
                {isSaving ? 'Saving...' : 'Save Workflow'}
              </Button>
            </div>
          </div>

          {/* Mobile Step Indicator */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps?.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === activeStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index < activeStep 
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < activeStep ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps?.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < activeStep ? 'bg-success' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Step {activeStep + 1} of {steps?.length}: {steps?.[activeStep]}
            </p>
          </div>

          {/* Workflow Metadata */}
          <WorkflowMetadata
            workflowName={workflowName}
            setWorkflowName={setWorkflowName}
            workflowDescription={workflowDescription}
            setWorkflowDescription={setWorkflowDescription}
            isActive={isActive}
            setIsActive={setIsActive}
          />

          {/* Desktop Three-Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            <TriggerSelector
              selectedTrigger={selectedTrigger}
              onTriggerSelect={setSelectedTrigger}
            />
            <ActionConfigurator
              selectedActions={selectedActions}
              onActionsChange={setSelectedActions}
            />
            <WorkflowPreview
              selectedTrigger={selectedTrigger}
              selectedActions={selectedActions}
              workflowName={workflowName}
            />
          </div>

          {/* Mobile Stepped Interface */}
          <div className="lg:hidden">
            {activeStep === 0 && (
              <TriggerSelector
                selectedTrigger={selectedTrigger}
                onTriggerSelect={setSelectedTrigger}
              />
            )}
            {activeStep === 1 && (
              <ActionConfigurator
                selectedActions={selectedActions}
                onActionsChange={setSelectedActions}
              />
            )}
            {activeStep === 2 && (
              <WorkflowPreview
                selectedTrigger={selectedTrigger}
                selectedActions={selectedActions}
                workflowName={workflowName}
              />
            )}

            {/* Mobile Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                {activeStep + 1} of {steps?.length}
              </div>
              <Button
                onClick={() => setActiveStep(Math.min(steps?.length - 1, activeStep + 1))}
                disabled={activeStep === steps?.length - 1}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-8 bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${selectedTrigger ? 'text-success' : 'text-muted-foreground'}`}>
                  <Icon name={selectedTrigger ? 'CheckCircle' : 'Circle'} size={16} />
                  <span>Trigger Selected</span>
                </div>
                <div className={`flex items-center space-x-2 ${selectedActions?.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                  <Icon name={selectedActions?.length > 0 ? 'CheckCircle' : 'Circle'} size={16} />
                  <span>{selectedActions?.length} Actions Added</span>
                </div>
                <div className={`flex items-center space-x-2 ${workflowName?.trim() ? 'text-success' : 'text-muted-foreground'}`}>
                  <Icon name={workflowName?.trim() ? 'CheckCircle' : 'Circle'} size={16} />
                  <span>Workflow Named</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                canSave ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {canSave ? 'Ready to Save' : 'Incomplete'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowBuilder;