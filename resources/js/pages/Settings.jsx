import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { updatePassword } from '../services/api';

export default function Settings() {
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.new_password !== passwords.new_password_confirmation) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        if (passwords.new_password.length < 8) {
            setStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await updatePassword(passwords);
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswords({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-[#1B365D]">System Settings</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your account security and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Password Change */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 sm:p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 text-[#1B365D] rounded-2xl">
                                    <KeyRound size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1B365D]">Change Password</h3>
                                    <p className="text-sm text-gray-400">Regularly updating your password keeps your account secure</p>
                                </div>
                            </div>

                            {status.message && (
                                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
                                    status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-bold">{status.message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            type="password" 
                                            name="current_password"
                                            value={passwords.current_password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-semibold"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">New Password</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input 
                                                type="password" 
                                                name="new_password"
                                                value={passwords.new_password}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#8CC63F] focus:bg-white transition-all font-semibold"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input 
                                                type="password" 
                                                name="new_password_confirmation"
                                                value={passwords.new_password_confirmation}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#8CC63F] focus:bg-white transition-all font-semibold"
                                                placeholder="Re-enter new password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#1B365D] to-[#25497d] text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-[#1B365D]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info/Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1B365D] to-[#0a182b] p-8 rounded-[2.5rem] text-white shadow-xl">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <Shield className="text-[#8CC63F]" size={24} />
                        </div>
                        <h4 className="text-xl font-black mb-4 tracking-tight">Security Tips</h4>
                        <ul className="space-y-4 text-sm text-gray-300 font-medium">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] mt-1.5 flex-shrink-0"></div>
                                Use at least 8 characters with a mix of letters, numbers, and symbols.
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] mt-1.5 flex-shrink-0"></div>
                                Avoid using common words or personal information like your name or birthday.
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] mt-1.5 flex-shrink-0"></div>
                                Don't reuse passwords from other important accounts.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[#8CC63F] p-8 rounded-[2.5rem] shadow-xl text-[#1B365D]">
                        <h4 className="font-black text-lg mb-2">Need Help?</h4>
                        <p className="text-sm font-bold opacity-80 mb-4 tracking-tight">If you encounter any issues with your account, please contact the system administrator.</p>
                        <button className="px-6 py-2.5 bg-[#1B365D] text-[#8CC63F] rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all">Support Center</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
