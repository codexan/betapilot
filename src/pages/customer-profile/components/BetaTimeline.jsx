import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BetaTimeline = ({ betaHistory }) => {
  const [filter, setFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const filterOptions = [
    { value: 'all', label: 'All Betas' },
    { value: 'current', label: 'Current' },
    { value: 'past', label: 'Past' },
    { value: 'future', label: 'Future' },
    { value: 'nda-signed', label: 'NDA Signed' },
    { value: 'nda-pending', label: 'NDA Pending' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'bg-accent text-accent-foreground';
      case 'past':
        return 'bg-muted text-muted-foreground';
      case 'future':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getNDAStatusColor = (status) => {
    switch (status) {
      case 'signed':
        return 'text-accent';
      case 'pending':
        return 'text-warning';
      case 'not-required':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredHistory = betaHistory?.filter(beta => {
    if (filter === 'all') return true;
    if (filter === 'nda-signed') return beta?.ndaStatus === 'signed';
    if (filter === 'nda-pending') return beta?.ndaStatus === 'pending';
    return beta?.status === filter;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-0">Beta Participation Timeline</h3>
        <Select
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          placeholder="Filter by status"
          className="w-full sm:w-48"
        />
      </div>
      <div className="space-y-4">
        {filteredHistory?.map((beta) => (
          <div key={beta?.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-base font-medium text-foreground">{beta?.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(beta?.status)}`}>
                    {beta?.status?.charAt(0)?.toUpperCase() + beta?.status?.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="text-foreground font-medium">{beta?.startDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date:</span>
                    <p className="text-foreground font-medium">{beta?.endDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NDA Status:</span>
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={beta?.ndaStatus === 'signed' ? 'CheckCircle' : beta?.ndaStatus === 'pending' ? 'Clock' : 'Minus'} 
                        size={14} 
                        className={getNDAStatusColor(beta?.ndaStatus)} 
                      />
                      <p className={`font-medium ${getNDAStatusColor(beta?.ndaStatus)}`}>
                        {beta?.ndaStatus === 'signed' ? 'Signed' : beta?.ndaStatus === 'pending' ? 'Pending' : 'Not Required'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="MessageSquare" size={14} />
                    <span>{beta?.communicationCount} communications</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="FileText" size={14} />
                    <span>{beta?.feedbackCount} feedback submissions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Activity" size={14} />
                    <span>{beta?.participationScore}% participation</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(beta?.id)}
                iconName={expandedItems?.has(beta?.id) ? "ChevronUp" : "ChevronDown"}
              >
                Details
              </Button>
            </div>

            {expandedItems?.has(beta?.id) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-3">Communication History</h5>
                    <div className="space-y-2">
                      {beta?.communications?.map((comm, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 bg-muted/50 rounded-md">
                          <Icon name="Mail" size={14} className="text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{comm?.date}</p>
                            <p className="text-sm text-foreground">{comm?.subject}</p>
                            <p className="text-xs text-muted-foreground">{comm?.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-3">Feedback Submissions</h5>
                    <div className="space-y-2">
                      {beta?.feedbacks?.map((feedback, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 bg-muted/50 rounded-md">
                          <Icon name="MessageCircle" size={14} className="text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{feedback?.date}</p>
                            <p className="text-sm text-foreground">{feedback?.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                feedback?.priority === 'high' ? 'bg-error/10 text-error' :
                                feedback?.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
                              }`}>
                                {feedback?.priority}
                              </span>
                              <span className="text-xs text-muted-foreground">{feedback?.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <h5 className="text-sm font-medium text-foreground mb-2">Participation Metrics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <p className="text-lg font-semibold text-foreground">{beta?.metrics?.loginCount}</p>
                      <p className="text-muted-foreground">Logins</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <p className="text-lg font-semibold text-foreground">{beta?.metrics?.sessionDuration}</p>
                      <p className="text-muted-foreground">Avg Session</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <p className="text-lg font-semibold text-foreground">{beta?.metrics?.featuresUsed}</p>
                      <p className="text-muted-foreground">Features Used</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <p className="text-lg font-semibold text-foreground">{beta?.metrics?.bugsReported}</p>
                      <p className="text-muted-foreground">Bugs Reported</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredHistory?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No beta participation history found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetaTimeline;