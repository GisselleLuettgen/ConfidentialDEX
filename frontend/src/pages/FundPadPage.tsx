import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNotification } from '../context/NotificationContext';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, APP_CONFIG } from '../config/constants';
import { Plus, Calendar, Target, Users, TrendingUp, Eye, EyeOff, Loader, ExternalLink } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  targetAmount: string;
  raised: string;
  deadline: number;
  creator: string;
  isActive: boolean;
  backers: number;
}

const FundPadPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(true);

  const { isConnected, signer, connectWallet } = useWallet();
  const { addNotification } = useNotification();

  // Mock data for demonstration
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: 1,
        name: "DeFi Privacy Tools",
        description: "Building next-generation privacy tools for DeFi protocols using zero-knowledge proofs",
        targetAmount: "100",
        raised: hideAmounts ? "****" : "45.7",
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
        creator: "0x1234...5678",
        isActive: true,
        backers: 127
      },
      {
        id: 2,
        name: "Confidential NFT Marketplace",
        description: "A marketplace for trading NFTs with hidden prices and private transactions",
        targetAmount: "250",
        raised: hideAmounts ? "****" : "182.3",
        deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
        creator: "0xabcd...efgh",
        isActive: true,
        backers: 89
      },
      {
        id: 3,
        name: "Private Lending Protocol",
        description: "Decentralized lending with confidential loan amounts and interest rates",
        targetAmount: "500",
        raised: hideAmounts ? "****" : "356.8",
        deadline: Date.now() + 45 * 24 * 60 * 60 * 1000,
        creator: "0x9876...4321",
        isActive: true,
        backers: 203
      }
    ];
    setProjects(mockProjects);
  }, [hideAmounts]);

  const handleCreateProject = async (formData: {
    name: string;
    description: string;
    targetAmount: string;
    duration: number;
  }) => {
    if (!isConnected || !signer) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to create a project'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject: Project = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        targetAmount: formData.targetAmount,
        raised: "0",
        deadline: Date.now() + formData.duration * 24 * 60 * 60 * 1000,
        creator: "0x" + Math.random().toString(16).substr(2, 8) + "...abcd",
        isActive: true,
        backers: 0
      };

      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);
      
      addNotification({
        type: 'success',
        title: 'Project Created!',
        message: 'Your fundraising project has been successfully created'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create project. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (amount: string) => {
    if (!isConnected || !signer) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to contribute'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowContributeModal(false);
      addNotification({
        type: 'success',
        title: 'Contribution Successful!',
        message: `You've successfully contributed ${amount} ETH`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Contribution Failed',
        message: 'Failed to contribute. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (deadline: number) => {
    const timeLeft = deadline - Date.now();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  const getProgressPercentage = (raised: string, target: string) => {
    if (hideAmounts) return 0;
    return Math.min((parseFloat(raised) / parseFloat(target)) * 100, 100);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Confidential <span className="gradient-text">FundPad</span>
            </h1>
            <p className="text-gray-400">
              Launch and support projects with complete privacy using FHE encryption
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setHideAmounts(!hideAmounts)}
              className="btn-secondary flex items-center space-x-2"
            >
              {hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{hideAmounts ? 'Show Amounts' : 'Hide Amounts'}</span>
            </button>
            
            {isConnected ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {hideAmounts ? '****' : '1,247'}
            </div>
            <div className="text-gray-400 text-sm">Total Raised (ETH)</div>
          </div>
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-white mb-2">{projects.length}</div>
            <div className="text-gray-400 text-sm">Active Projects</div>
          </div>
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {hideAmounts ? '***' : '589'}
            </div>
            <div className="text-gray-400 text-sm">Total Backers</div>
          </div>
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="text-2xl font-bold text-white mb-2">100%</div>
            <div className="text-gray-400 text-sm">Privacy Level</div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Contract Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white ml-2">{NETWORK_CONFIG.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">FundPad Contract:</span>
                  <div className="flex items-center space-x-2 ml-2">
                    <code className="text-crypto-blue font-mono text-xs">
                      {CONTRACT_ADDRESSES.FUND_PAD.slice(0, 10)}...{CONTRACT_ADDRESSES.FUND_PAD.slice(-8)}
                    </code>
                    <a 
                      href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESSES.FUND_PAD}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crypto-blue hover:text-crypto-purple transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white ml-2">{APP_CONFIG.version}</span>
                </div>
                <div>
                  <span className="text-gray-400">Gas Optimized:</span>
                  <span className="text-crypto-green ml-2">✓ Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass-card rounded-xl overflow-hidden hover:neon-border transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                  <div className="flex items-center space-x-1 text-xs bg-crypto-green/20 text-crypto-green px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-white">
                      {hideAmounts ? '***%' : `${getProgressPercentage(project.raised, project.targetAmount).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-crypto-blue to-crypto-purple h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(project.raised, project.targetAmount)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-crypto-blue" />
                      <span className="text-xs text-gray-400">Target</span>
                    </div>
                    <div className="text-white font-semibold">
                      {hideAmounts ? '*** ETH' : `${project.targetAmount} ETH`}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-crypto-green" />
                      <span className="text-xs text-gray-400">Raised</span>
                    </div>
                    <div className="text-white font-semibold">
                      {hideAmounts ? '*** ETH' : `${project.raised} ETH`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{project.backers} backers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimeLeft(project.deadline)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowContributeModal(true);
                  }}
                  className="w-full btn-primary"
                >
                  Support Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateProject} loading={loading} />}

        {/* Contribute Modal */}
        {showContributeModal && selectedProject && (
          <ContributeModal
            project={selectedProject}
            onClose={() => setShowContributeModal(false)}
            onContribute={handleContribute}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Create Project Modal Component
const CreateProjectModal: React.FC<{
  onClose: () => void;
  onCreate: (data: any) => void;
  loading: boolean;
}> = ({ onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    duration: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              className="input-field w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              required
              rows={3}
              className="input-field w-full resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Amount (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              required
              className="input-field w-full"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (Days)
            </label>
            <select
              className="input-field w-full"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contribute Modal Component
const ContributeModal: React.FC<{
  project: Project;
  onClose: () => void;
  onContribute: (amount: string) => void;
  loading: boolean;
}> = ({ project, onClose, onContribute, loading }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContribute(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Support Project</h2>
        <p className="text-gray-400 mb-6">{project.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contribution Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              required
              className="input-field w-full text-xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000"
            />
            <p className="text-xs text-gray-500 mt-2">
              🔒 Your contribution amount will be encrypted and kept private
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Project Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Creator:</span>
                <span className="text-white">{project.creator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deadline:</span>
                <span className="text-white">{formatTimeLeft(project.deadline)}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Contribute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formatTimeLeft = (deadline: number) => {
  const timeLeft = deadline - Date.now();
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  return `${days} days left`;
};

export default FundPadPage;