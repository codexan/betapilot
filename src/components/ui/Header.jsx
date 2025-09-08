import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();


  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'BarChart3' },
    { label: 'Customers', path: '/customer-directory', icon: 'Users' }, 
    { label: 'Templates', path: '/email-templates', icon: 'Mail' },
    { label: 'Workflows', path: '/workflow-builder', icon: 'GitBranch' },
  ];

  const isActivePath = (path) => {
    if (path === '/customer-directory') {
      return location?.pathname === '/customer-directory' || location?.pathname === '/customer-profile';
    }
    return location?.pathname === path;
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    // Logout logic here
    console.log('Logout clicked');
    
    const { error } = await signOut();
    setIsUserMenuOpen(false);
    if (error) {
      console.error('Error signing out:', error);
      // optionally show a toast here
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border h-16">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">BetaPilot</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-2">
            {/* User Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <Icon name="ChevronDown" size={16} />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-elevated z-[1010]">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground">john.doe@company.com</p>
                  </div>
                  <div className="py-1">
                    <button className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-smooth">
                      <Icon name="Settings" size={16} className="mr-2" />
                      Settings
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-smooth">
                      <Icon name="HelpCircle" size={16} className="mr-2" />
                      Help
                    </button>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-error hover:bg-muted transition-smooth"
                    >
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1020] md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleMobileMenuToggle} />
          <div className="fixed top-16 left-0 right-0 bg-card border-b border-border shadow-elevated">
            <nav className="p-4 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={handleMobileMenuToggle}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-smooth ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;