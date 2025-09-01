import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNotification } from '../context/NotificationContext';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/constants';
import { 
  TrendingUp, 
  ArrowUpDown, 
  Eye, 
  EyeOff, 
  Loader, 
  Plus,
  Minus,
  RefreshCw,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface TokenPair {
  id: string;
  tokenA: string;
  tokenB: string;
  symbolA: string;
  symbolB: string;
  price: string;
  volume24h: string;
  change24h: number;
}

interface Order {
  id: string;
  type: 'buy' | 'sell';
  pair: string;
  amount: string;
  price: string;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

const DEXPage: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<TokenPair | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(true);
  const [balances, setBalances] = useState<{ [key: string]: string }>({});

  const { isConnected, signer, connectWallet } = useWallet();
  const { addNotification } = useNotification();

  // Trading pairs using deployed contract addresses
  const tradingPairs: TokenPair[] = [
    {
      id: 'eth-usdt',
      tokenA: '0x0000000000000000000000000000000000000000',
      tokenB: CONTRACT_ADDRESSES.USDT,
      symbolA: 'ETH',
      symbolB: 'USDT',
      price: hideAmounts ? '****' : '2,347.82',
      volume24h: hideAmounts ? '****' : '1.2M',
      change24h: 2.34
    },
    {
      id: 'eth-usdc',
      tokenA: '0x0000000000000000000000000000000000000000',
      tokenB: CONTRACT_ADDRESSES.USDC,
      symbolA: 'ETH',
      symbolB: 'USDC',
      price: hideAmounts ? '****' : '2,346.91',
      volume24h: hideAmounts ? '****' : '890K',
      change24h: 1.87
    },
    {
      id: 'eth-dai',
      tokenA: '0x0000000000000000000000000000000000000000',
      tokenB: CONTRACT_ADDRESSES.DAI,
      symbolA: 'ETH',
      symbolB: 'DAI',
      price: hideAmounts ? '****' : '2,345.67',
      volume24h: hideAmounts ? '****' : '567K',
      change24h: -0.45
    }
  ];

  useEffect(() => {
    if (tradingPairs.length > 0) {
      setSelectedPair(tradingPairs[0]);
    }

    // Mock balances
    setBalances({
      'ETH': hideAmounts ? '****' : '5.2341',
      'USDT': hideAmounts ? '****' : '12,456.78',
      'USDC': hideAmounts ? '****' : '8,903.21',
      'DAI': hideAmounts ? '****' : '3,456.89'
    });
  }, [hideAmounts]);

  const handleCreateOrder = async () => {
    if (!isConnected || !signer) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to trade'
      });
      return;
    }

    if (!selectedPair || !amount || !price) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newOrder: Order = {
        id: Date.now().toString(),
        type: orderType,
        pair: `${selectedPair.symbolA}/${selectedPair.symbolB}`,
        amount,
        price,
        status: 'pending',
        timestamp: Date.now()
      };

      setOrders(prev => [newOrder, ...prev]);
      setAmount('');
      setPrice('');

      addNotification({
        type: 'success',
        title: 'Order Created!',
        message: `Your ${orderType} order has been submitted`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Failed to create order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDepositETH = async () => {
    if (!isConnected || !signer) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to deposit'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      addNotification({
        type: 'success',
        title: 'Deposit Successful!',
        message: 'ETH has been deposited to your trading account'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deposit Failed',
        message: 'Failed to deposit ETH. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Confidential <span className="gradient-text">DEX</span>
            </h1>
            <p className="text-gray-400">
              Trade with complete privacy using encrypted order books
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
                onClick={handleDepositETH}
                className="btn-primary flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Deposit ETH</span>
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

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Trading Pairs */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Trading Pairs</h2>
              <div className="space-y-2">
                {tradingPairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedPair?.id === pair.id
                        ? 'bg-crypto-blue/20 border border-crypto-blue/50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white">
                          {pair.symbolA}/{pair.symbolB}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${pair.price}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        pair.change24h >= 0 ? 'text-crypto-green' : 'text-red-400'
                      }`}>
                        {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Balances */}
            <div className="glass-card rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Balances</h3>
              <div className="space-y-3">
                {Object.entries(balances).map(([token, balance]) => (
                  <div key={token} className="flex justify-between items-center">
                    <span className="text-gray-400">{token}</span>
                    <span className="text-white font-medium">{balance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-6">
            {selectedPair && (
              <div className="glass-card rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedPair.symbolA}/{selectedPair.symbolB}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-crypto-blue" />
                    <span className="text-2xl font-bold text-white">
                      ${selectedPair.price}
                    </span>
                    <span className={`text-sm font-medium ${
                      selectedPair.change24h >= 0 ? 'text-crypto-green' : 'text-red-400'
                    }`}>
                      {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}%
                    </span>
                  </div>
                </div>

                {/* Order Type Tabs */}
                <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                      orderType === 'buy'
                        ? 'bg-crypto-green text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Buy {selectedPair.symbolA}
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                      orderType === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sell {selectedPair.symbolA}
                  </button>
                </div>

                {/* Order Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount ({selectedPair.symbolA})
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="input-field w-full"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price ({selectedPair.symbolB})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field w-full"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total */}
                {amount && price && (
                  <div className="glass-card p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-xl font-bold text-white">
                        {hideAmounts ? '*** ' : (parseFloat(amount) * parseFloat(price)).toFixed(2) + ' '}
                        {selectedPair.symbolB}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      🔒 Your order will be encrypted and processed privately
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreateOrder}
                  disabled={loading || !isConnected}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                    orderType === 'buy'
                      ? 'bg-crypto-green hover:bg-crypto-green/80'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.symbolA}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Market Stats */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Market Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">24h Volume</div>
                  <div className="text-lg font-semibold text-white">
                    {selectedPair?.volume24h || '---'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">24h Change</div>
                  <div className={`text-lg font-semibold ${
                    (selectedPair?.change24h || 0) >= 0 ? 'text-crypto-green' : 'text-red-400'
                  }`}>
                    {selectedPair?.change24h ? 
                      `${selectedPair.change24h >= 0 ? '+' : ''}${selectedPair.change24h}%` : 
                      '---'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Order History</h3>
                <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No orders yet</p>
                    <p className="text-sm text-gray-500">Your trading history will appear here</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.type === 'buy' 
                              ? 'bg-crypto-green/20 text-crypto-green' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {order.type.toUpperCase()}
                          </span>
                          <span className="text-white text-sm">{order.pair}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'filled' 
                            ? 'bg-crypto-green/20 text-crypto-green'
                            : order.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Amount: {hideAmounts ? '***' : order.amount}</div>
                        <div>Price: {hideAmounts ? '***' : order.price}</div>
                        <div>{formatTime(order.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DEXPage;