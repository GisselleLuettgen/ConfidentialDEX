import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-crypto-darker via-crypto-dark to-gray-900 flex items-center justify-center">
      <div className="crypto-pattern fixed inset-0"></div>
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 glass-card rounded-full flex items-center justify-center pulse-glow">
            <div className="w-12 h-12 bg-gradient-to-r from-crypto-blue to-crypto-purple rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Zama FundPad</h1>
          <p className="text-gray-400">Confidential Fundraising & DEX Platform</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-crypto-blue rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-crypto-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-crypto-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-300">
          <p className="mb-2">Initializing encrypted environment...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-crypto-blue rounded-full animate-pulse"></div>
            <span>Powered by Zama FHE</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="glass-card p-1 rounded-full">
            <div className="h-2 bg-gradient-to-r from-crypto-blue to-crypto-purple rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;