import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  balance: string;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required to use this application');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const network = await newProvider.getNetwork();

        setProvider(newProvider);
        setSigner(newSigner);
        setAccount(accounts[0]);
        setIsConnected(true);
        setChainId(Number(network.chainId));

        // Get balance
        const balanceWei = await newProvider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balanceWei));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
    setChainId(null);
  };

  const switchNetwork = async (targetChainId: string) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Zama Devnet',
                nativeCurrency: {
                  name: 'Zama',
                  symbol: 'ZAMA',
                  decimals: 18,
                },
                rpcUrls: ['https://devnet.zama.ai'],
                blockExplorerUrls: ['https://devnet.zama.ai/explorer'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      } else {
        console.error('Failed to switch network:', error);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        });

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        // Reload the page to avoid any inconsistent state
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value: WalletContextType = {
    isConnected,
    account,
    provider,
    signer,
    balance,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};