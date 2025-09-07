import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartCampaign = () => {
    navigate('/campaign/create');
  };

  const handleViewCampaigns = () => {
    navigate('/customer-directory');
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 border border-border rounded-2xl p-8 lg:p-12 mb-8 overflow-hidden">
      {/* Background Abstract Illustration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-transparent dark:from-blue-800/10 rounded-full"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-gradient-to-tr from-indigo-100/40 to-transparent dark:from-indigo-800/10 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-200/50 to-transparent dark:from-purple-800/20 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Rocket" size={28} className="text-white" />
          </div>
        </div>

        {/* Headlines */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Launch Your Next Beta Campaign{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            in Minutes
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
          Engage testers, collect feedback, and accelerate product improvements with our streamlined beta management platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleStartCampaign}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-[200px]"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Start New Campaign
          </Button>
          
          <button
            onClick={handleViewCampaigns}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-lg transition-colors duration-200 flex items-center"
          >
            View Existing Campaigns
            <Icon name="ArrowRight" size={16} className="ml-1" />
          </button>
        </div>

        {/* Stats Preview */}
        <div className="mt-10 lg:mt-12 flex flex-wrap justify-center gap-6 lg:gap-8 text-sm">
          <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <Icon name="Users" size={16} className="text-blue-600 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">1,247+ Beta Testers</span>
          </div>
          <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <Icon name="Mail" size={16} className="text-green-600 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">96% Email Success Rate</span>
          </div>
          <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <Icon name="Clock" size={16} className="text-purple-600 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">5min Setup Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;