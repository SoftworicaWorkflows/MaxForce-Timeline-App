import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, DollarSign, Loader2, AlertCircle, Save } from 'lucide-react';
import { updateCustomer } from '../services/api';

export default function EditCustomerModal({ isOpen, customer, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        price: '',
        service_interval: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && customer) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                price: customer.price || '',
                service_interval: customer.service_interval || ''
            });
            setError('');
            setSuccess(false);
        }
    }, [isOpen, customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await updateCustomer(customer.id, formData);
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onUpdateSuccess?.();
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Failed to update customer');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during update');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center text-[#1B365D]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8CC63F] mb-1 text-center sm:text-left">Edit Record</p>
                        <h2 className="text-2xl font-black">Customer Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-2xl p-3 transition-all transform hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* Status Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                                <Save size={16} />
                            </div>
                            <p className="text-sm font-bold text-green-800">Customer updated successfully!</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                                <AlertCircle size={16} />
                            </div>
                            <p className="text-sm font-bold text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B365D] transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900"
                                    placeholder="Customer Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Info Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B365D] transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900"
                                        placeholder="Ph number"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B365D] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900"
                                        placeholder="Email (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Field */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Service Address
                            </label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#1B365D] transition-colors" size={18} />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900 min-h-[100px] resize-none"
                                    placeholder="Full service address..."
                                />
                            </div>
                        </div>
                        {/* Price Field */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Base Price (AUD)
                            </label>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8CC63F]" size={18} />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Service Interval Field */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Next Service Reminder
                            </label>
                            <div className="relative group">
                                <select
                                    name="service_interval"
                                    value={formData.service_interval}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                >
                                    <option value="">No Reminder</option>
                                    <option value="3w">3 Weeks Later</option>
                                    <option value="3m">3 Months Later</option>
                                    <option value="6m">6 Months Later</option>
                                    <option value="12m">12 Months Later</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="flex-[2] px-6 py-4 bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                {loading ? 'Saving...' : 'Update Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}