import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { updateCustomer } from '../services/api';

const InputField = ({ icon: Icon, label, type = "text", required = false, placeholder, value, onChange }) => (
    <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
            {label}
            {required && <span className="text-[#8CC63F] ml-1">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon size={14} />
            </div>
            <input 
                type={type} 
                required={required} 
                placeholder={placeholder} 
                value={value || ''} 
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-semibold text-sm outline-none" 
            />
        </div>
    </div>
);

export default function EditCustomerModal({ isOpen, customer, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || ''
            });
        }
    }, [customer]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await updateCustomer(customer.id, formData);
            onUpdateSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#1B365D]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#1B365D] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <User size={20} className="text-[#8CC63F]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white leading-none">Edit Customer</h3>
                            <p className="text-[10px] text-[#8CC63F] font-bold uppercase tracking-widest mt-1">Updating ID #{customer?.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                             <div className="p-1 bg-red-500 rounded-full text-white">
                                <X size={10} />
                             </div>
                             <p className="text-xs font-bold text-red-700">{error}</p>
                        </div>
                    )}

                    <InputField 
                        icon={User}
                        label="Customer Name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />

                    <InputField 
                        icon={Phone}
                        label="Phone Number"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />

                    <InputField 
                        icon={Mail}
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />

                    <InputField 
                        icon={MapPin}
                        label="Service Address"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                    />

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 font-black rounded-xl hover:bg-gray-100 transition-all text-xs uppercase"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-[2] bg-[#8CC63F] text-[#1B365D] py-4 rounded-xl font-black uppercase tracking-wider hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
