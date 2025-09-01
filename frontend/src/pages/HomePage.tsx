import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, TrendingUp, DollarSign, Users, Zap, ChevronRight, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Fully Confidential',
      description: 'All transactions and data are encrypted using Zama FHE protocol',
      color: 'crypto-blue'
    },
    {
      icon: DollarSign,
      title: 'Private Fundraising',
      description: 'Raise funds privately with encrypted contribution amounts',
      color: 'crypto-purple'
    },
    {
      icon: TrendingUp,
      title: 'Confidential DEX',
      description: 'Trade tokens with complete privacy and hidden order books',
      color: 'crypto-green'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Decentralized governance with private voting mechanisms',
      color: 'crypto-blue'
    }
  ];

  const stats = [
    { label: 'Total Raised', value: '$2.5M+', encrypted: true },
    { label: 'Active Projects', value: '150+', encrypted: false },
    { label: 'Private Trades', value: '10K+', encrypted: true },
    { label: 'Community Members', value: '5K+', encrypted: false }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-8">
              <Zap className="w-4 h-4 text-crypto-blue" />
              <span className="text-sm text-gray-300">Powered by Zama FHE Protocol</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              The Future of{' '}
              <span className="gradient-text">Confidential</span>
              <br />
              DeFi is Here
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              Experience truly private fundraising and trading with our FHE-powered platform.
              Raise funds, trade tokens, and participate in DeFi while keeping your financial data completely confidential.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
              <Link to="/fundpad" className="btn-primary inline-flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Launch FundPad
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/dex" className="btn-secondary inline-flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trade on DEX
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-6 rounded-xl text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl lg:text-3xl font-bold text-white">
                      {stat.value}
                    </span>
                    {stat.encrypted && (
                      <Lock className="w-4 h-4 text-crypto-blue ml-2" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-crypto-blue/20 rounded-full blur-xl floating-animation"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-crypto-purple/20 rounded-full blur-xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-crypto-green/20 rounded-full blur-xl floating-animation" style={{ animationDelay: '4s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Zama FundPad</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built on cutting-edge Fully Homomorphic Encryption technology for unmatched privacy and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-card p-6 rounded-xl hover:neon-border transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-${feature.color}/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the power of confidential computing in three simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-blue to-crypto-purple rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h3>
              <p className="text-gray-400">
                Connect your MetaMask wallet and switch to the Zama network for confidential transactions
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-purple to-crypto-green rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Encrypt Your Data</h3>
              <p className="text-gray-400">
                All your transaction amounts and data are automatically encrypted using FHE before being submitted
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-crypto-green to-crypto-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Trade & Fund Privately</h3>
              <p className="text-gray-400">
                Create projects, make investments, and trade tokens while maintaining complete privacy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-crypto-blue/10 to-crypto-purple/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 lg:p-12 rounded-2xl">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-crypto-green fill-current" />
                ))}
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Experience <span className="gradient-text">Private DeFi</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust Zama FundPad for their confidential DeFi needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/fundpad" className="btn-primary inline-flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Start Fundraising
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/dex" className="btn-secondary inline-flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trade Now
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;