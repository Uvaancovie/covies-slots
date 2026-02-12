
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import History from './pages/History';
import Bonuses from './pages/Bonuses';
import Admin from './pages/Admin';
import Account from './pages/Account';
import Auth from './pages/Auth';
import DepositModal from './components/DepositModal';

const Layout: React.FC = () => {
    const { isAuthenticated } = useApp();
    const [showDeposit, setShowDeposit] = useState(false);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white flex flex-col font-sans selection:bg-yellow-500/50 overflow-x-hidden">
            <Navbar onOpenDeposit={() => setShowDeposit(true)} />
            <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 z-10 pb-20">
                <Outlet context={{ openDeposit: () => setShowDeposit(true) }} />
            </main>
            <footer className="mt-4 mb-4 text-center text-[10px] text-yellow-600/40 uppercase tracking-widest font-bold px-4">
                <p>&copy; 2025 Covies Casino. All Rights Reserved.</p>
                <p className="mt-1">High Stakes Simulation.</p>
            </footer>

            {showDeposit && (
                <DepositModal 
                    onClose={() => setShowDeposit(false)} 
                    onDeposit={(amount) => {/* Logic handled in modal via context */}} 
                />
            )}
        </div>
    );
};

// Wrapper for the Game Slot to pass outlet context
const GamePage: React.FC = () => {
    const context = useOutletContext<{ openDeposit: () => void }>();
    const triggerDeposit = context?.openDeposit || (() => console.log('Deposit modal not connected'));

    return <SlotMachine onOpenDeposit={triggerDeposit} />;
};

// Protected Route wrapper using custom auth
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useApp();
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
};

const AppContent: React.FC = () => {
    const { isAuthenticated } = useApp();
    
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth route - redirect to home if already logged in */}
                <Route 
                    path="/auth" 
                    element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
                />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<GamePage />} />
                    <Route path="history" element={<History />} />
                    <Route path="bonuses" element={<Bonuses />} />
                    <Route path="account" element={<Account />} />
                    <Route path="admin" element={<Admin />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

// Auth page wrapper with proper styling
const AuthPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 flex items-center justify-center">
            <Auth />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <AppContent />
        <Analytics />
    </AppProvider>
  );
};

export default App;
