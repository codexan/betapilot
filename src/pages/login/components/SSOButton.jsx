import React from 'react';

import Icon from '../../../components/AppIcon';

const SSOButton = ({ provider, onClick, loading, disabled }) => {
  const providerConfig = {
    google: {
      icon: 'Chrome',
      text: 'Sign in with Google',
      bgColor: 'bg-white',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      hoverBg: 'hover:bg-gray-50'
    },
    microsoft: {
      icon: 'Square',
      text: 'Sign in with Microsoft',
      bgColor: 'bg-[#0078d4]',
      textColor: 'text-white',
      borderColor: 'border-[#0078d4]',
      hoverBg: 'hover:bg-[#106ebe]'
    }
  };

  const config = providerConfig?.[provider];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-lg border transition-smooth font-medium ${config?.bgColor} ${config?.textColor} ${config?.borderColor} ${config?.hoverBg} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <div className="animate-spin">
          <Icon name="Loader2" size={20} />
        </div>
      ) : (
        <Icon name={config?.icon} size={20} />
      )}
      <span>{config?.text}</span>
    </button>
  );
};

export default SSOButton;