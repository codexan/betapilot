import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import CustomerProfile from './pages/customer-profile';
import Login from './pages/login';
import CustomerDirectory from './pages/customer-directory';
import Dashboard from './pages/dashboard';
import EmailTemplates from './pages/email-templates';
import WorkflowBuilder from './pages/workflow-builder';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<CustomerDirectory />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer-directory" element={<CustomerDirectory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/workflow-builder" element={<WorkflowBuilder />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
