import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
    const { login, register, continueAsGuest } = useApp();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await register(email, name || email.split('@')[0], password);
            }

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestPlay = () => {
        continueAsGuest();
        navigate('/');
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-yellow-500 selection:text-black">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 z-10" />
                <img
                    src="/images/landing.png"
                    alt="Casino Background"
                    className="w-full h-full object-cover opacity-60 animate-pulse-slow"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-20 min-h-screen container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 py-12">

                {/* Left Side: Hero Copy */}
                <div className="flex-1 text-center md:text-left space-y-8 max-w-2xl">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Now
                        </span>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[0.9] text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
                            COVIES <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">SLOTS</span> <br />
                            <span className="text-white outline-text">CASINO</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                            Join the fastest growing virtual casino. <br />
                            <span className="text-white font-bold">Get R100 FREE</span> when you play as a guest today.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                        <button
                            onClick={handleGuestPlay}
                            className="group relative px-8 py-5 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-xl font-black uppercase tracking-widest text-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Start With R100 Free
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-8">
                        {[
                            { label: 'Instant Payouts', icon: '⚡' },
                            { label: 'Fair Play', icon: '🛡️' },
                            { label: '24/7 Support', icon: '💬' }
                        ].map((item, i) => (
                            <div key={i} className="text-center md:text-left">
                                <div className="text-xl mb-1">{item.icon}</div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Winning Combos & Payouts */}
                    <div className="mt-12 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-yellow-500/20">
                        <h4 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-4 border-b border-yellow-500/20 pb-2">Top Payouts & Features</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💎</span>
                                        <span className="text-gray-300 font-bold">Wild</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">500x</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🍒</span>
                                        <span className="text-gray-300 font-bold">Cherry</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">250x</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🍋</span>
                                        <span className="text-gray-300 font-bold">Lemon</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">200x</span>
                                </div>
                            </div>
                            <div className="space-y-3 border-l border-white/10 pl-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⭐</span>
                                        <span className="text-gray-300 font-bold">Scatter</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">Free Spins</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🍉</span>
                                        <span className="text-gray-300 font-bold">Melon</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">120x</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🍇</span>
                                        <span className="text-gray-300 font-bold">Grape</span>
                                    </div>
                                    <span className="text-yellow-400 font-mono font-bold">100x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Card */}
                <div className="w-full max-w-md">
                    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-colors duration-500">
                        {/* Glass Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {isLogin ? 'Member Access' : 'Create Account'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {isLogin ? 'Welcome back, High Roller' : 'Join and save your progress'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:bg-black/80 focus:outline-none transition-all"
                                            placeholder="Choose Username"
                                        />
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:bg-black/80 focus:outline-none transition-all"
                                        placeholder="Email Address"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:bg-black/80 focus:outline-none transition-all"
                                        placeholder="Password"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-gray-200 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Join Now')}
                                </button>
                            </form>

                            <div className="mt-6 text-center border-t border-white/5 pt-6">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-yellow-500 transition-colors"
                                >
                                    {isLogin ? "New here? Create Account" : "Have an account? Sign In"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Decorator for Form */}
                    <div className="mt-6 flex justify-center opacity-50">
                        <img src="/images/landing-2.png" alt="Featured Game" className="w-24 h-auto object-contain animate-float" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
