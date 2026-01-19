
import React from 'react';
import { useApp } from '../context/AppContext';

const Bonuses: React.FC = () => {
    const { user } = useApp();

    const copyReferral = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            alert("Referral code copied!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase italic tracking-tighter">
                    Promotions
                </h1>
                <p className="text-gray-400 mt-2">Boost your balance with our exclusive offers.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Referral Card */}
                <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-32 h-32 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Refer a Friend</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Invite your friends to Covies Casino and receive <span className="text-yellow-400 font-bold">R50 Bonus</span> for every successful sign-up!
                    </p>
                    
                    <div className="bg-black/60 rounded-lg p-4 border border-purple-500/50 flex flex-col gap-2">
                        <span className="text-xs text-gray-500 uppercase font-bold">Your Referral Code</span>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-purple-900/20 text-purple-300 font-mono text-lg p-2 rounded text-center border border-dashed border-purple-700">
                                {user?.referralCode || 'LOGIN-TO-VIEW'}
                            </code>
                            <button 
                                onClick={copyReferral}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Free Spins Card */}
                <div className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                         <svg className="w-40 h-40 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Bonus</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        New here? We've credited your account with a starter balance. Keep playing to unlock daily mystery bonuses.
                    </p>
                    <div className="mt-auto">
                        <button className="w-full py-3 bg-yellow-600/20 border border-yellow-600 text-yellow-500 font-bold uppercase rounded hover:bg-yellow-600 hover:text-white transition">
                            Check for Bonuses
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bonuses;
