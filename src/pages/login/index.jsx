import React from 'react';
import LoginHeader from './components/LoginHeader';
import AuthCard from './components/AuthCard';

const Login = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LoginHeader />
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Marketing Content */}
            <div className="hidden lg:block">
              <div className="max-w-lg">
                <h1 className="text-4xl font-bold text-foreground mb-6">
                  Streamline Your Beta Testing Process
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Manage testers, automate communications, and track beta campaigns 
                  with powerful workflow automation tools designed for product managers.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">✓</span>
                    </div>
                    <span className="text-foreground">Automated tester recruitment and management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">✓</span>
                    </div>
                    <span className="text-foreground">Rich email templates with personalization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">✓</span>
                    </div>
                    <span className="text-foreground">Workflow automation and tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-semibold text-sm">✓</span>
                    </div>
                    <span className="text-foreground">Enterprise-grade security and compliance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Card */}
            <div className="w-full">
              <AuthCard />
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} PilotBeta. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;