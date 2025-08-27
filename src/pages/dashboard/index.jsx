import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricCard from './components/MetricCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import WelcomeHeader from './components/WelcomeHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalTesters: { value: 1247, change: '+12%', changeType: 'positive' },
    activeInvitations: { value: 89, change: '+5%', changeType: 'positive' },
    ndasSigned: { value: 156, change: '+8%', changeType: 'positive' },
    pendingInvites: { value: 23, change: '-15%', changeType: 'negative' }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeInvitations: {
          ...prev?.activeInvitations,
          value: prev?.activeInvitations?.value + Math.floor(Math.random() * 3) - 1
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMetricClick = (metricType) => {
    switch (metricType) {
      case 'totalTesters': case'pendingInvites': navigate('/customer-directory');
        break;
      case 'activeInvitations': navigate('/customer-directory');
        break;
      case 'ndasSigned': navigate('/customer-directory');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          <WelcomeHeader />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Testers"
              value={metrics?.totalTesters?.value?.toLocaleString()}
              change={metrics?.totalTesters?.change}
              changeType={metrics?.totalTesters?.changeType}
              icon="Users"
              onClick={() => handleMetricClick('totalTesters')}
            />
            <MetricCard
              title="Active Invitations"
              value={metrics?.activeInvitations?.value}
              change={metrics?.activeInvitations?.change}
              changeType={metrics?.activeInvitations?.changeType}
              icon="Mail"
              onClick={() => handleMetricClick('activeInvitations')}
            />
            <MetricCard
              title="NDAs Signed"
              value={metrics?.ndasSigned?.value}
              change={metrics?.ndasSigned?.change}
              changeType={metrics?.ndasSigned?.changeType}
              icon="FileCheck"
              onClick={() => handleMetricClick('ndasSigned')}
            />
            <MetricCard
              title="Pending Invites"
              value={metrics?.pendingInvites?.value}
              change={metrics?.pendingInvites?.change}
              changeType={metrics?.pendingInvites?.changeType}
              icon="Clock"
              onClick={() => handleMetricClick('pendingInvites')}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <ActivityFeed />
            </div>

            {/* Quick Actions - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>

          {/* Additional Stats Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Campaign Performance</h3>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">iOS Beta v2.1</span>
                  <span className="text-sm font-medium text-success">92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Response Rate</h3>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">This Week</span>
                  <span className="text-sm font-medium text-primary">78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Email Delivery</h3>
                <div className="w-2 h-2 bg-accent rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Success Rate</span>
                  <span className="text-sm font-medium text-accent">96%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;