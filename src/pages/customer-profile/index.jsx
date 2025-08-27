import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProfileCard from './components/ProfileCard';
import TechnicalDetails from './components/TechnicalDetails';
import BetaTimeline from './components/BetaTimeline';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock customer data
  const mockCustomer = {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@techcorp.com",
    organization: "TechCorp Solutions",
    jobTitle: "Senior Product Manager",
    region: "North America",
    timezone: "PST",
    language: "English",
    segments: ["Enterprise", "Product Manager", "Early Adopter"],
    joinDate: "2023-03-15",
    lastActivity: "2024-08-20"
  };

  const mockTechnicalInfo = {
    devices: [
      { name: "iPhone 15 Pro", type: "Mobile" },
      { name: "MacBook Pro M3", type: "Desktop" },
      { name: "iPad Air", type: "Tablet" }
    ],
    operatingSystems: ["iOS 17", "macOS Sonoma", "iPadOS 17"],
    browsers: ["Safari", "Chrome", "Firefox"],
    experienceLevel: "Advanced",
    testingExperience: "5+ years"
  };

  const mockBetaHistory = [
    {
      id: 1,
      name: "Mobile App Beta v2.1",
      status: "current",
      startDate: "2024-08-01",
      endDate: "2024-09-15",
      ndaStatus: "signed",
      communicationCount: 12,
      feedbackCount: 8,
      participationScore: 92,
      communications: [
        {
          date: "2024-08-20",
          subject: "Weekly Beta Update #3",
          type: "Newsletter"
        },
        {
          date: "2024-08-15",
          subject: "New Feature Available for Testing",
          type: "Feature Announcement"
        },
        {
          date: "2024-08-10",
          subject: "Beta Feedback Request",
          type: "Survey"
        }
      ],
      feedbacks: [
        {
          date: "2024-08-18",
          title: "Navigation issue on iOS",
          priority: "high",
          category: "Bug Report"
        },
        {
          date: "2024-08-12",
          title: "Feature suggestion for dashboard",
          priority: "medium",
          category: "Enhancement"
        }
      ],
      metrics: {
        loginCount: 45,
        sessionDuration: "25 min",
        featuresUsed: 18,
        bugsReported: 3
      }
    },
    {
      id: 2,
      name: "Web Platform Beta v3.0",
      status: "past",
      startDate: "2024-05-01",
      endDate: "2024-07-30",
      ndaStatus: "signed",
      communicationCount: 18,
      feedbackCount: 12,
      participationScore: 88,
      communications: [
        {
          date: "2024-07-25",
          subject: "Beta Program Completion",
          type: "Completion Notice"
        },
        {
          date: "2024-07-15",
          subject: "Final Testing Phase",
          type: "Phase Update"
        }
      ],
      feedbacks: [
        {
          date: "2024-07-20",
          title: "Performance improvements needed",
          priority: "medium",
          category: "Performance"
        },
        {
          date: "2024-07-10",
          title: "UI/UX feedback for new design",
          priority: "low",
          category: "Design"
        }
      ],
      metrics: {
        loginCount: 67,
        sessionDuration: "32 min",
        featuresUsed: 24,
        bugsReported: 5
      }
    },
    {
      id: 3,
      name: "API Integration Beta v1.5",
      status: "future",
      startDate: "2024-09-01",
      endDate: "2024-10-31",
      ndaStatus: "pending",
      communicationCount: 2,
      feedbackCount: 0,
      participationScore: 0,
      communications: [
        {
          date: "2024-08-22",
          subject: "Beta Program Invitation",
          type: "Invitation"
        }
      ],
      feedbacks: [],
      metrics: {
        loginCount: 0,
        sessionDuration: "0 min",
        featuresUsed: 0,
        bugsReported: 0
      }
    }
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customers', path: '/customer-directory' },
    { label: `${mockCustomer?.firstName} ${mockCustomer?.lastName}`, path: '/customer-profile' }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setCustomer(mockCustomer);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = (updatedData) => {
    setCustomer(updatedData);
    // Here you would typically make an API call to save the data
    console.log('Saving profile:', updatedData);
  };

  const handleSendEmail = () => {
    navigate('/email-templates', { 
      state: { 
        recipientEmail: customer?.email,
        recipientName: `${customer?.firstName} ${customer?.lastName}`
      }
    });
  };

  const handleAddToBeta = () => {
    // Here you would typically open a modal or navigate to beta assignment
    console.log('Adding to beta:', customer?.email);
  };

  const handleBackToDirectory = () => {
    navigate('/customer-directory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <Icon name="Loader2" size={32} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <Button
              variant="outline"
              onClick={handleBackToDirectory}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Directory
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Profile & Technical Details */}
            <div className="lg:col-span-4">
              <ProfileCard
                customer={customer}
                onSave={handleSaveProfile}
                onSendEmail={handleSendEmail}
                onAddToBeta={handleAddToBeta}
              />
              <TechnicalDetails technicalInfo={mockTechnicalInfo} />
            </div>

            {/* Right Column - Beta Timeline */}
            <div className="lg:col-span-8">
              <BetaTimeline betaHistory={mockBetaHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;