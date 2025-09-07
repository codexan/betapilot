import React from "react";
import { Navigate,BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import CustomerProfile from './pages/customer-profile';
import Login from './pages/login';
import CustomerDirectory from './pages/customer-directory';
import Dashboard from './pages/dashboard';
import EmailTemplates from './pages/email-templates';
import WorkflowBuilder from './pages/workflow-builder';
import CalendarIntegrationHub from './pages/calendar-integration-hub';
import CampaignCreationWizard from './pages/campaign-creation-wizard/index';
import GoogleOAuthCallback from "./components/oauth/GoogleOAuthCallback";


const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer-directory" element={<CustomerDirectory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/email-templates" element={<EmailTemplates />} />
          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
          <Route path="/calendar-integration-hub" element={<CalendarIntegrationHub />} />
          <Route path="/campaign/create" element={<CampaignCreationWizard />} />
          <Route path="/campaign-creation-wizard" element={<CampaignCreationWizard />} />
          
          {/* Google OAuth Callback Route */}
          <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
          
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;