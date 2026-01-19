
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar: React.FC<{ onOpenDeposit: () => void }> = ({ onOpenDeposit }) => {
    const { user, balance, logout } = useApp();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const linkClass = ({ isActive }: { isActive: boolean }) => 
        `text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`;

    return (
        <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-700 flex items-center justify-center font-black text-black">C</div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-black text-xl text-white tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                                COVIES<span className="text-yellow-500">CASINO</span>
                            </span>
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 text-[10px] font-black tracking-[0.2em]">
                                SLOTS
                            </span>
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex space-x-8">
                        <NavLink to="/" className={linkClass}>Play</NavLink>
                        <NavLink to="/history" className={linkClass}>History</NavLink>
                        <NavLink to="/bonuses" className={linkClass}>Bonuses</NavLink>
                        <NavLink to="/account" className={linkClass}>Account</NavLink>
                        {user?.isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
                    </div>

                    {/* Right Side: Balance & User */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 rounded-full pl-4 pr-1 py-1 border border-gray-700">
                            <span className="text-yellow-400 font-mono font-bold">{balance.toFixed(2)} ZAR</span>
                            <button 
                                onClick={onOpenDeposit}
                                className="bg-green-600 hover:bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs"
                            >
                                +
                            </button>
                        </div>

                        <div className="relative group">
                             <div className="flex items-center gap-2 cursor-pointer">
                                 <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                                     {user?.name.charAt(0) || 'U'}
                                 </div>
                             </div>
                             {/* Dropdown */}
                             <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                                 <div className="px-4 py-2 border-b border-gray-800">
                                     <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                                     <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                                 </div>
                                 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800">
                                     Sign Out
                                 </button>
                             </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-900 border-b border-white/10 px-4 py-4 space-y-4">
                    <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-yellow-400 font-bold">Play Now</NavLink>
                    <NavLink to="/history" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-yellow-400 font-bold">History</NavLink>
                    <NavLink to="/bonuses" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-yellow-400 font-bold">Bonuses & Referrals</NavLink>
                    <NavLink to="/account" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-yellow-400 font-bold">My Account</NavLink>
                    {user?.isAdmin && <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-yellow-400 font-bold">Admin Dashboard</NavLink>}
                    <div className="pt-4 border-t border-gray-800">
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-yellow-400 font-mono font-bold">{balance.toFixed(2)} ZAR</span>
                             <button onClick={() => { onOpenDeposit(); setIsMenuOpen(false); }} className="px-4 py-1 bg-green-600 rounded text-white text-xs font-bold uppercase">Deposit</button>
                         </div>
                         <button onClick={handleLogout} className="text-red-400 text-sm font-bold uppercase">Sign Out</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
