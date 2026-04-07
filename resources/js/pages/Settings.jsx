import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, AlertCircle, Loader2, KeyRound, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { updatePassword } from '../services/api';

export default function Settings() {
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        
        if (name === 'new_password') {
            evaluatePasswordStrength(value);
        }
        
        // Clear status when user starts typing
        if (status.message) {
            setStatus({ type: '', message: '' });
        }
    };

    const evaluatePasswordStrength = (password) => {
        let score = 0;
        let feedback = '';
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) feedback = 'Weak';
        else if (score <= 4) feedback = 'Medium';
        else feedback = 'Strong';
        
        setPasswordStrength({ score, feedback });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePassword = () => {
        if (passwords.new_password !== passwords.new_password_confirmation) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return false;
        }

        if (passwords.new_password.length < 8) {
            setStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
            return false;
        }

        if (passwords.new_password === passwords.current_password) {
            setStatus({ type: 'error', message: 'New password must be different from current password.' });
            return false;
        }

        if (passwordStrength.score <= 2) {
            setStatus({ type: 'error', message: 'Please choose a stronger password for better security.' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePassword()) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await updatePassword({
                current_password: passwords.current_password,
                new_password: passwords.new_password,
                new_password_confirmation: passwords.new_password_confirmation
            });
            
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswords({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
            setPasswordStrength({ score: 0, feedback: '' });
            
            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                if (status.type === 'success') {
                    setStatus({ type: '', message: '' });
                }
            }, 5000);
            
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || error.message || 'Failed to update password.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength.feedback === 'Strong') return 'bg-green-500';
        if (passwordStrength.feedback === 'Medium') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="mb-8 md:mb-12 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">System Settings</h2>
                    <p className="text-sm text-gray-600 font-medium">Manage your account security and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Main Form Column */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <KeyRound size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                                        <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                                    </div>
                                </div>

                                {/* Status Messages */}
                                {status.message && (
                                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                                        status.type === 'success' 
                                            ? 'bg-green-50 border border-green-200 text-green-700' 
                                            : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}>
                                        {status.type === 'success' ? (
                                            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                        )}
                                        <p className="text-sm font-medium">{status.message}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            <input 
                                                type={showPasswords.current ? "text" : "password"}
                                                name="current_password"
                                                value={passwords.current_password}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Passwords Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative group">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input 
                                                    type={showPasswords.new ? "text" : "password"}
                                                    name="new_password"
                                                    value={passwords.new_password}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading}
                                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            
                                            {/* Password Strength Indicator */}
                                            {passwords.new_password && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div 
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                                    i < passwordStrength.score 
                                                                        ? getStrengthColor() 
                                                                        : 'bg-gray-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs font-medium ${
                                                        passwordStrength.feedback === 'Strong' ? 'text-green-600' :
                                                        passwordStrength.feedback === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        Password strength: {passwordStrength.feedback}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative group">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input 
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    name="new_password_confirmation"
                                                    value={passwords.new_password_confirmation}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading}
                                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {passwords.new_password_confirmation && passwords.new_password !== passwords.new_password_confirmation && (
                                                <p className="mt-2 text-xs text-red-600 font-medium">
                                                    Passwords do not match
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={loading || !passwords.current_password || !passwords.new_password}
                                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={18} />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Tips & Help */}
                    <div className="space-y-6 order-1 lg:order-2">
                        {/* Security Tips Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="text-green-400" size={24} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Security Tips</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Use at least 8 characters with a mix of letters, numbers, and symbols</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Avoid common words or personal information like your name or birthday</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Don't reuse passwords from other important accounts</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Enable two-factor authentication for additional security</span>
                                </li>
                            </ul>
                        </div>

                        {/* Help Card */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-green-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                <HelpCircle className="text-blue-600" size={24} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">Need Help?</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                If you encounter any issues with your account or need assistance with security settings, our support team is here to help.
                            </p>
                            <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}