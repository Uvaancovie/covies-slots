
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface DepositModalProps {
    onClose: () => void;
    onDeposit: (amountZAR: number) => void;
}

const SA_BANKS = [
    { name: 'Capitec', color: 'bg-red-600', logo: 'C' },
    { name: 'FNB', color: 'bg-cyan-600', logo: 'F' },
    { name: 'Standard Bank', color: 'bg-blue-700', logo: 'S' },
    { name: 'Absa', color: 'bg-red-700', logo: 'A' },
    { name: 'Nedbank', color: 'bg-green-700', logo: 'N' },
    { name: 'TymeBank', color: 'bg-orange-500', logo: 'T' }
];

const CRYPTO_RATES: Record<string, number> = {
    BTC: 1250000,
    ETH: 62000,
    SOL: 2800,
    USDT: 19
};

const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
    const { addTransaction } = useApp();
    const [activeTab, setActiveTab] = useState<'BANK' | 'CRYPTO'>('BANK');
    const [amount, setAmount] = useState<string>('');
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const zarAmount = activeTab === 'CRYPTO' 
        ? parseFloat(amount || '0') * CRYPTO_RATES[selectedCrypto]
        : parseFloat(amount || '0');

    const handleDeposit = () => {
        if (zarAmount <= 0) return;
        setIsProcessing(true);
        
        const method = activeTab === 'BANK' ? `EFT - ${selectedBank}` : `Crypto - ${selectedCrypto}`;

        setTimeout(() => {
            addTransaction('DEPOSIT', zarAmount, method);
            setIsProcessing(false);
            setSuccessMsg('Deposit Successful!');
            setTimeout(() => {
                onClose();
            }, 1000);
        }, 1500);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-gray-900 border-2 border-yellow-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-900/50 to-black p-4 border-b border-yellow-800 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase text-yellow-500 tracking-wider">Deposit Funds</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button 
                        onClick={() => setActiveTab('BANK')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'BANK' ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        SA Instant EFT
                    </button>
                    <button 
                        onClick={() => setActiveTab('CRYPTO')}
                        className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'CRYPTO' ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Crypto Currency
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Bank Selection */}
                    {activeTab === 'BANK' && (
                        <div className="space-y-4">
                            <label className="text-xs text-gray-400 uppercase font-bold">Select Your Bank</label>
                            <div className="grid grid-cols-3 gap-3">
                                {SA_BANKS.map(bank => (
                                    <button
                                        key={bank.name}
                                        onClick={() => setSelectedBank(bank.name)}
                                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${selectedBank === bank.name ? 'border-yellow-500 bg-yellow-900/20 ring-1 ring-yellow-500' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${bank.color} flex items-center justify-center text-white font-bold text-sm`}>
                                            {bank.logo}
                                        </div>
                                        <span className="text-[10px] text-white font-bold">{bank.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Crypto Selection */}
                    {activeTab === 'CRYPTO' && (
                        <div className="grid grid-cols-4 gap-2">
                             {Object.keys(CRYPTO_RATES).map((crypto) => (
                                <button
                                    key={crypto}
                                    onClick={() => setSelectedCrypto(crypto)}
                                    className={`p-2 rounded-lg border text-center transition-all ${selectedCrypto === crypto ? 'border-yellow-500 bg-yellow-900/20 text-yellow-400' : 'border-gray-700 bg-gray-800 text-gray-400'}`}
                                >
                                    <span className="font-bold text-xs">{crypto}</span>
                                </button>
                             ))}
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-bold ml-1">
                            {activeTab === 'BANK' ? 'Amount (ZAR)' : `Amount (${selectedCrypto})`}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                {activeTab === 'BANK' ? 'R' : ''}
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className={`w-full bg-black border border-gray-700 rounded-xl py-3 pr-4 text-white font-mono text-lg focus:outline-none focus:border-yellow-600 transition-colors ${activeTab === 'BANK' ? 'pl-8' : 'pl-4'}`}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-400 uppercase font-bold">Total To Account</span>
                        <div className="text-right">
                            <div className="text-2xl font-black text-white">{zarAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="text-[10px] text-yellow-600 font-bold">ZAR</div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMsg && (
                        <div className="bg-green-900/30 border border-green-600 text-green-400 text-center p-2 rounded-lg text-sm font-bold animate-pulse">
                            {successMsg}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleDeposit}
                        disabled={zarAmount <= 0 || isProcessing || (activeTab === 'BANK' && !selectedBank)}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all
                            ${zarAmount > 0 && !isProcessing && (activeTab === 'CRYPTO' || selectedBank)
                                ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-black hover:from-yellow-500 hover:to-yellow-700 shadow-yellow-900/20 transform active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                        `}
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Deposit'}
                    </button>
                    
                    {activeTab === 'BANK' && (
                        <p className="text-[10px] text-center text-gray-500">
                            Instant EFT payments are processed via secure gateway. <br/>Funds reflect immediately.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
