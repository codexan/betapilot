import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../AppIcon';

const Footer = ({ variant = 'default' }) => {
  const currentYear = new Date()?.getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} BetaPilot. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                to="/privacy-policy" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center"
              >
                Privacy Policy
              </Link>
              <a 
                href="#" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card border-t border-border py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BetaPilot. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth flex items-center"
            >
              Privacy Policy
            </Link>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;