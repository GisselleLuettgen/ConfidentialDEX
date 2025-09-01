import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import FundPadPage from './pages/FundPadPage';
import DEXPage from './pages/DEXPage';
import { WalletProvider } from './context/WalletContext';
import { NotificationProvider } from './context/NotificationContext';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <WalletProvider>
      <NotificationProvider>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-crypto-darker via-crypto-dark to-gray-900">
            <div className="crypto-pattern min-h-screen">
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/fundpad" element={<FundPadPage />} />
                <Route path="/dex" element={<DEXPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </WalletProvider>
  );
}

export default App;