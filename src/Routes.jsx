import React from "react";
import { Navigate,BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
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
import BetaSlotBooking from './pages/beta-slot-booking';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
          
          {/* Protected routes */}
          <Route path="/customer-profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
          <Route path="/customer-directory" element={<ProtectedRoute><CustomerDirectory /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
          <Route path="/workflow-builder" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
          <Route path="/calendar-integration-hub" element={<ProtectedRoute><CalendarIntegrationHub /></ProtectedRoute>} />
          <Route path="/campaign/create" element={<ProtectedRoute><CampaignCreationWizard /></ProtectedRoute>} />
          <Route path="/campaign-creation-wizard" element={<ProtectedRoute><CampaignCreationWizard /></ProtectedRoute>} />

          {/* Public Beta Slot Booking Route */}
          <Route path="/beta-slot-booking" element={<ProtectedRoute><BetaSlotBooking /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;