
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
    const { login, register } = useApp();
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

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-black border border-yellow-900/30 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
                            COVIES<span className="text-yellow-500">CASINO</span>
                        </h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
                            {isLogin ? 'Welcome Back' : 'Join the High Rollers'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                                    placeholder="Enter username"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 text-black font-black uppercase tracking-widest py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-gray-400 text-sm hover:text-white underline decoration-gray-600 underline-offset-4"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
                
                {/* Decorative Bottom */}
                <div className="h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-800"></div>
            </div>
        </div>
    );
};

export default Auth;
