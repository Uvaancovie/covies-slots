
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Account: React.FC = () => {
    const { user, balance, gameHistory, transactions, logout } = useApp();
    const navigate = useNavigate();
    const [showSelfExclusion, setShowSelfExclusion] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'responsible'>('overview');

    if (!user) {
        return null;
    }

    // Account statistics
    const totalSpins = gameHistory.length;
    const totalWagered = gameHistory.reduce((sum, g) => sum + g.bet, 0);
    const totalWon = gameHistory.reduce((sum, g) => sum + g.win, 0);
    const netProfit = totalWon - totalWagered;
    const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0);
    const accountAge = user.createdAt ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) : 0;

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const handleSelfExclusion = () => {
        if (confirm('⚠️ Self-Exclusion: This action will immediately log you out and prevent future access. Continue?')) {
            alert('Self-exclusion activated. Your account has been locked. Please contact support for assistance.');
            logout();
            navigate('/auth');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">My Account</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your profile, security, and responsible gaming settings</p>
                </div>
                {user.isAdmin && (
                    <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold uppercase tracking-widest">
                        Admin
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-800 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-bold text-sm uppercase tracking-widest transition-colors border-b-2 ${
                        activeTab === 'overview'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 font-bold text-sm uppercase tracking-widest transition-colors border-b-2 ${
                        activeTab === 'security'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Security
                </button>
                <button
                    onClick={() => setActiveTab('responsible')}
                    className={`px-4 py-2 font-bold text-sm uppercase tracking-widest transition-colors border-b-2 ${
                        activeTab === 'responsible'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Responsible Gaming
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Account Information */}
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5" /> Profile Information
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Full Name</label>
                                <div className="text-white font-medium mt-1">{user.name}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Email Address</label>
                                <div className="text-white font-medium mt-1">{user.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
                                <div className="text-gray-400 font-mono text-sm mt-1">{user.id.slice(0, 16)}...</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Account Age</label>
                                <div className="text-white font-medium mt-1">{accountAge} days</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Current Balance</label>
                                <div className="text-2xl font-bold text-yellow-400 mt-1">{balance.toFixed(2)} ZAR</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Account Status</label>
                                <div className="mt-1">
                                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold uppercase">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Gaming Statistics */}
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <ChartIcon className="w-5 h-5" /> Gaming Statistics
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold text-white">{totalSpins}</div>
                                <div className="text-xs text-gray-500 uppercase mt-1">Total Spins</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold text-red-400">{totalWagered.toFixed(2)}</div>
                                <div className="text-xs text-gray-500 uppercase mt-1">Total Wagered</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-2xl font-bold text-green-400">{totalWon.toFixed(2)}</div>
                                <div className="text-xs text-gray-500 uppercase mt-1">Total Won</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 uppercase mt-1">Net P/L</div>
                            </div>
                        </div>
                    </section>

                    {/* Financial Summary */}
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <WalletIcon className="w-5 h-5" /> Financial Summary
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total Deposits</div>
                                <div className="text-2xl font-bold text-green-400">{totalDeposits.toFixed(2)} ZAR</div>
                                <div className="text-xs text-gray-600 mt-1">{transactions.filter(t => t.type === 'DEPOSIT').length} transactions</div>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total Withdrawals</div>
                                <div className="text-2xl font-bold text-red-400">{totalWithdrawals.toFixed(2)} ZAR</div>
                                <div className="text-xs text-gray-600 mt-1">{transactions.filter(t => t.type === 'WITHDRAWAL').length} transactions</div>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Net Balance Change</div>
                                <div className={`text-2xl font-bold ${(totalDeposits - totalWithdrawals + netProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {(totalDeposits - totalWithdrawals + netProfit).toFixed(2)} ZAR
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Lifetime</div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <ShieldIcon className="w-5 h-5" /> Account Security
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white">Password</div>
                                        <div className="text-sm text-gray-400 mt-1">Last changed: Never (demo mode)</div>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-colors border border-gray-700">
                                        Change
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white">Two-Factor Authentication</div>
                                        <div className="text-sm text-gray-400 mt-1">Add an extra layer of security</div>
                                    </div>
                                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold uppercase">
                                        Not Enabled
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white">Email Notifications</div>
                                        <div className="text-sm text-gray-400 mt-1">Receive alerts for account activity</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-bold text-red-400 flex items-center gap-2">
                                            <WarningIcon className="w-5 h-5" /> Sign Out
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">Log out from this device</div>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Responsible Gaming Tab */}
            {activeTab === 'responsible' && (
                <div className="space-y-6">
                    {/* Gambling Awareness */}
                    <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                            <HeartIcon className="w-5 h-5" /> Responsible Gaming Commitment
                        </h2>
                        <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                            <p>At Covies Casino, we are committed to promoting responsible gaming and ensuring our platform remains a source of entertainment, not harm.</p>
                            <p className="font-bold text-white">Remember:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                                <li>Gambling should be fun, not a way to make money</li>
                                <li>Never gamble more than you can afford to lose</li>
                                <li>Set time and money limits before you play</li>
                                <li>Take regular breaks and maintain balance in your life</li>
                                <li>Seek help if gambling is causing problems</li>
                            </ul>
                        </div>
                    </section>

                    {/* Play Limits */}
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5" /> Set Play Limits
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-bold text-white">Daily Deposit Limit</div>
                                    <div className="text-sm text-gray-400">Not Set</div>
                                </div>
                                <div className="text-sm text-gray-400">Restrict how much you can deposit per day</div>
                                <button className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-gray-700">
                                    Set Limit
                                </button>
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-bold text-white">Session Time Limit</div>
                                    <div className="text-sm text-gray-400">Not Set</div>
                                </div>
                                <div className="text-sm text-gray-400">Set a maximum play session duration</div>
                                <button className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-gray-700">
                                    Set Limit
                                </button>
                            </div>

                            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-bold text-white">Loss Limit</div>
                                    <div className="text-sm text-gray-400">Not Set</div>
                                </div>
                                <div className="text-sm text-gray-400">Stop playing after losing a certain amount</div>
                                <button className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-gray-700">
                                    Set Limit
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Self-Exclusion */}
                    <section className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                            <ExclamationIcon className="w-5 h-5" /> Self-Exclusion
                        </h2>
                        <div className="space-y-4">
                            <div className="text-gray-300 text-sm leading-relaxed">
                                <p className="mb-3">If you feel that gambling is negatively affecting your life, you can request self-exclusion. This will:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
                                    <li>Immediately close your account</li>
                                    <li>Prevent you from creating new accounts</li>
                                    <li>Block access to all gaming features</li>
                                    <li>Require manual review to reactivate</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setShowSelfExclusion(true)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest transition-colors w-full"
                            >
                                Request Self-Exclusion
                            </button>

                            {showSelfExclusion && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                    <div className="bg-gray-900 border border-red-500 rounded-xl p-6 max-w-md w-full">
                                        <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ Confirm Self-Exclusion</h3>
                                        <p className="text-gray-300 text-sm mb-6">
                                            This action cannot be easily reversed. Your account will be immediately locked, and you will be logged out. Are you sure you want to proceed?
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowSelfExclusion(false)}
                                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSelfExclusion}
                                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Help Resources */}
                    <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <PhoneIcon className="w-5 h-5" /> Get Help
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="font-bold text-white mb-1">National Gambling Helpline (South Africa)</div>
                                <div className="text-yellow-400 font-mono">0800 006 008</div>
                                <div className="text-gray-400 text-xs mt-1">Free, confidential support 24/7</div>
                            </div>
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="font-bold text-white mb-1">NRGP (National Responsible Gambling Programme)</div>
                                <a href="https://www.responsiblegambling.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    www.responsiblegambling.co.za
                                </a>
                            </div>
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="font-bold text-white mb-1">Gamblers Anonymous</div>
                                <a href="https://www.gamblersanonymous.org.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    www.gamblersanonymous.org.za
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

// Icons
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);

const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

export default Account;
