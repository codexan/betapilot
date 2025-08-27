import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link to="/login" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="Zap" size={24} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">BetaPilot</h1>
            <p className="text-xs text-muted-foreground">Beta Testing Management</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default LoginHeader;