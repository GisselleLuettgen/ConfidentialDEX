import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Menu, X, Wallet, Shield, TrendingUp, Home, DollarSign } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, account, balance, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <nav className="glass-card border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-crypto-blue to-crypto-purple rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">Zama FundPad</h1>
                <p className="text-xs text-gray-400">Confidential DeFi</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-crypto-blue/20 text-crypto-blue' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/fundpad"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/fundpad') 
                  ? 'bg-crypto-purple/20 text-crypto-purple' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>FundPad</span>
            </Link>
            
            <Link
              to="/dex"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/dex') 
                  ? 'bg-crypto-green/20 text-crypto-green' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>DEX</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && account ? (
              <div className="hidden sm:flex items-center space-x-2 glass-card px-4 py-2 rounded-lg">
                <div className="text-right">
                  <div className="text-sm text-white font-medium">
                    {formatAddress(account)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatBalance(balance)} ETH
                  </div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-crypto-green to-crypto-blue rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : null}

            <button
              onClick={isConnected ? disconnectWallet : connectWallet}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isConnected
                  ? 'btn-secondary hover:bg-red-500/20 hover:text-red-400'
                  : 'btn-primary'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:block">
                {isConnected ? 'Disconnect' : 'Connect Wallet'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-fade-in">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-crypto-blue/20 text-crypto-blue' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/fundpad"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/fundpad') 
                    ? 'bg-crypto-purple/20 text-crypto-purple' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>FundPad</span>
              </Link>
              
              <Link
                to="/dex"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/dex') 
                    ? 'bg-crypto-green/20 text-crypto-green' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>DEX</span>
              </Link>
            </div>

            {/* Mobile wallet info */}
            {isConnected && account && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-sm text-white font-medium">
                    {formatAddress(account)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatBalance(balance)} ETH
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;