import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            const response = await API.post(endpoint, formData);

            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            } else {
                setIsLogin(true);
                alert('Account registered successfully. Please log in.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-wide">LedgerCore Banking</h1>
                    <p className="text-slate-400 text-sm mt-1">High-Integrity Financial Operations</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-slate-300 text-sm mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-300 text-sm mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}