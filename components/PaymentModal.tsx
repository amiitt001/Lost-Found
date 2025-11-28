import React, { useState } from 'react';
import { X, CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { createPaymentTransaction } from '../services/kiraPayService';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState<string>('5');
    const [currency, setCurrency] = useState<string>('USDT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await createPaymentTransaction({
                amount: parseFloat(amount),
                currency,
                description: 'Donation to Seek & Find AI',
            });

            // Redirect to payment URL
            if (response.paymentUrl) {
                window.open(response.paymentUrl, '_blank');
                onClose();
            } else {
                setError('Failed to generate payment link. Please try again.');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <CreditCard className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Support Us</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-gray-600">
                            Your support helps us keep the platform running and free for everyone.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Amount
                            </label>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {['5', '10', '25'].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${amount === val
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                            }`}
                                    >
                                        ${val}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Custom amount"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                            >
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                                <option value="SOL">SOL</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Donate with KiraPay <ExternalLink className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400">
                        Secure payments powered by KiraPay
                    </p>
                </div>
            </div>
        </div>
    );
};
