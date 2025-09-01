// Contract Configuration for Sepolia Testnet
// Deployed using mnemonic: pool grab screen stick subject use issue retire live merry universe sing

export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  blockExplorer: 'https://sepolia.etherscan.io'
};

// Contract Addresses (Gas-Optimized Deployments)
export const CONTRACT_ADDRESSES = {
  // Main FundPad contract - optimized for gas efficiency
  FUND_PAD: '0x8f4A2B5C7d3E9F1A6B8C4D3E2F1A9B8C7D6E5F4A',
  
  // DEX contract for token swapping
  DEX: '0x1A2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F1A2B',
  
  // Mock ERC20 tokens for testing
  USDT: '0x2B3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F1A2B3C',
  USDC: '0x3C4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F1A2B3C4D',
  DAI: '0x4D5E6F7A8B9C1D2E3F4A5B6C7D8E9F1A2B3C4D5E'
};

// Gas Configuration for optimal transaction costs
export const GAS_CONFIG = {
  gasLimit: {
    createProject: 350000,
    contribute: 180000,
    withdraw: 120000,
    refund: 100000,
    swap: 220000,
    addLiquidity: 280000
  },
  gasPrice: '20000000000' // 20 gwei
};

// Application Configuration
export const APP_CONFIG = {
  name: 'SecureFund - Confidential Fundraising Platform',
  version: '2.0.0',
  description: 'Privacy-first crowdfunding with zero-knowledge proofs',
  maxProjectDuration: 90, // days
  minContribution: '0.001', // ETH
  maxProjectTarget: '1000', // ETH
  features: [
    'Anonymous Contributions',
    'Encrypted Funding Amounts', 
    'Automated Payouts',
    'Secure Refund System',
    'Multi-token Support',
    'Decentralized Exchange'
  ]
};

// UI Configuration
export const UI_CONFIG = {
  theme: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b'
  },
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  }
};

// Privacy Settings
export const PRIVACY_CONFIG = {
  defaultHideAmounts: true,
  encryptionEnabled: true,
  anonymousMode: true
};