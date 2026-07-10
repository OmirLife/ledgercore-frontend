import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [account, setAccount] = useState({ accountNumber: '', balance: '0.00' });
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState({ total_sent: '0', total_received: '0', total_topups: '0' });
    
    const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch account details (account number, balance)
    const fetchAccountDetails = async () => {
        try {
            const response = await API.get('/accounts/me');
            if (response.data && response.data.data) {
                setAccount({
                    accountNumber: response.data.data.account_number,
                    balance: response.data.data.balance
                });
            }
        } catch (err) {
            console.error('Failed to fetch account info:', err);
        }
    };

    // Fetch analytics summary metrics
    const fetchAnalytics = async () => {
        try {
            const response = await API.get('/accounts/analytics');
            if (response.data && response.data.data) {
                setAnalytics(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    // Fetch filtered transaction logs
    const fetchTransactionHistory = async () => {
        try {
            const response = await API.get('/transactions/history', {
                params: {
                    type: filterType,
                    search: searchQuery
                }
            });
            setTransactions(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch transaction history:', err);
        }
    };

    // Initial mount hook
    useEffect(() => {
        fetchAccountDetails();
        fetchAnalytics();
    }, []);

    // Re-fetch transactions on filter/search change
    useEffect(() => {
        fetchTransactionHistory();
    }, [filterType, searchQuery]);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        // Generate a unique client transaction key for idempotency
        const idempotencyKey = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        try {
            const response = await API.post('/transfers', {
                senderAccountNumber: account.accountNumber,
                receiverAccountNumber: receiverAccountNumber,
                amount: parseFloat(amount)
            }, {
                headers: {
                'Idempotency-Key': idempotencyKey
            }
            });

            setStatus({ loading: false, error: '', success: response.data.message });
            setReceiverAccountNumber('');
            setAmount('');
            
            // Refresh all live states after transfer
            fetchAccountDetails();
            fetchAnalytics();
            fetchTransactionHistory();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 
                             err.response?.data?.details?.[0]?.message || 
                             'Transfer execution failed';
            setStatus({ loading: false, error: errorMsg, success: '' });
        }
    };

    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/accounts/deposit', { amount: parseFloat(depositAmount) });
            setDepositAmount('');
            setShowDepositModal(false);
            
            // Refresh all live states after deposit
            fetchAccountDetails();
            fetchAnalytics();
            fetchTransactionHistory();
        } catch (err) {
            console.error('Deposit failed:', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
            <header className="max-w-5xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-xl font-bold text-white">LedgerCore Core Banking</h1>
                    <p className="text-sm text-slate-400">Authenticated User: {user.fullName || user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                    Sign Out
                </button>
            </header>

            <main className="max-w-5xl mx-auto mt-8 space-y-8">
                {/* Account Banner */}
                <div className="bg-gradient-to-r from-blue-900/60 to-slate-800 border border-blue-500/30 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Primary Account</span>
                        <h2 className="text-2xl font-mono text-white mt-1">{account.accountNumber || 'Loading...'}</h2>
                    </div>
                    <div className="text-left md:text-right flex items-center gap-6">
                        <div>
                            <span className="text-xs text-slate-400">Available Balance</span>
                            <div className="text-3xl font-bold text-emerald-400">
                                {parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-300">KZT</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            + Top Up
                        </button>
                    </div>
                </div>

                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Money Sent</span>
                        <div className="text-xl font-bold text-red-400 font-mono mt-1">
                            -{parseFloat(analytics.total_sent).toLocaleString('en-US', { minimumFractionDigits: 2 })} KZT
                        </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Money Received</span>
                        <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                            +{parseFloat(analytics.total_received).toLocaleString('en-US', { minimumFractionDigits: 2 })} KZT
                        </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Top-Ups</span>
                        <div className="text-xl font-bold text-blue-400 font-mono mt-1">
                            +{parseFloat(analytics.total_topups).toLocaleString('en-US', { minimumFractionDigits: 2 })} KZT
                        </div>
                    </div>
                </div>

                {/* Main Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Transfer Form */}
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                        <h2 className="text-lg font-semibold mb-4 text-blue-400">Execute Fund Transfer</h2>

                        {status.error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4">
                                {status.error}
                            </div>
                        )}

                        {status.success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm p-3 rounded-lg mb-4">
                                {status.success}
                            </div>
                        )}

                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">From Account (You)</label>
                                <input
                                    type="text"
                                    value={account.accountNumber}
                                    disabled
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Receiver Account Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g., ACC-888222"
                                    value={receiverAccountNumber}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none font-mono"
                                    onChange={(e) => setReceiverAccountNumber(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Transfer Amount (KZT)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status.loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 text-sm cursor-pointer"
                            >
                                {status.loading ? 'Processing Transaction...' : 'Confirm & Transfer'}
                            </button>
                        </form>
                    </div>

                    {/* Transaction History Section */}
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col justify-between h-full">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <h2 className="text-lg font-semibold text-slate-200">Recent Transactions</h2>
                                
                                {/* Filter & Search Controls */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search account..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-32 font-mono"
                                    />
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="transfer">Transfers</option>
                                        <option value="deposit">Top-Ups</option>
                                    </select>
                                </div>
                            </div>

                            {transactions.length === 0 ? (
                                <p className="text-xs text-slate-500 mt-4">No matching transactions found.</p>
                            ) : (
                                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                                    {transactions.map((tx) => {
                                        const isSelf = tx.sender_account === tx.receiver_account;
                                        const isOutgoing = tx.sender_account === account.accountNumber && !isSelf;

                                        return (
                                            <div
                                                key={tx.id}
                                                className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-lg flex justify-between items-center text-xs"
                                            >
                                                <div className="space-y-1">
                                                    <span className="font-mono text-slate-300 font-medium">
                                                        {isSelf ? 'Top-Up Deposit' : isOutgoing ? `To: ${tx.receiver_account}` : `From: ${tx.sender_account}`}
                                                    </span>
                                                    <p className="text-[10px] text-slate-500">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="text-right pl-4">
                                                    <span className={`font-semibold font-mono text-sm block ${isOutgoing ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {isOutgoing ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)} <span className="text-[10px] font-normal">KZT</span>
                                                    </span>
                                                    <span className="text-[10px] text-emerald-500/80 uppercase font-medium">
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                            System Status: Connected to local Express/PostgreSQL ledger engine.
                        </div>
                    </div>
                </div>
            </main>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-sm w-full space-y-4">
                        <h3 className="text-lg font-semibold text-white">Top Up Account Balance</h3>
                        <form onSubmit={handleDepositSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Amount (KZT)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="5000.00"
                                    value={depositAmount}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDepositModal(false)}
                                    className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}