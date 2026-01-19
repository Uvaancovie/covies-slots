
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Auth from './pages/Auth';
import History from './pages/History';
import Bonuses from './pages/Bonuses';
import Admin from './pages/Admin';
import Account from './pages/Account';
import DepositModal from './components/DepositModal';

const Layout: React.FC = () => {
    const { isAuthenticated } = useApp();
    const [showDeposit, setShowDeposit] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white flex flex-col font-sans selection:bg-yellow-500/50">
            <Navbar onOpenDeposit={() => setShowDeposit(true)} />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 z-10">
                <Outlet context={{ openDeposit: () => setShowDeposit(true) }} />
            </main>
            <footer className="mt-8 mb-4 text-center text-[10px] text-yellow-600/40 uppercase tracking-widest font-bold">
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


const AppContent: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<Layout />}>
                    <Route path="/" element={<GamePage />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/bonuses" element={<Bonuses />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <AppContent />
    </AppProvider>
  );
};

export default App;
