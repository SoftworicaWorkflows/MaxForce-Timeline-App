import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../services/api';
import { Calendar, Clock, User, Phone, Mail, Clipboard, Shield, CheckCircle, MapPin } from 'lucide-react';

const InputField = ({ icon: Icon, label, type = "text", required = false, placeholder, value, onChange, step }) => (
    <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Icon size={12} className="text-[#8CC63F]" />
            {label}
            {required && <span className="text-[#8CC63F]">*</span>}
        </label>
        <input 
            type={type} 
            required={required} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            step={step}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[#8CC63F] focus:border-[#8CC63F] outline-none font-semibold text-sm transition-all duration-200 hover:bg-white" 
        />
    </div>
);

export default function AddCustomer() {
    const navigate = useNavigate();
    const [createData, setCreateData] = useState({
        name: '', 
        phone: '', 
        email: '', 
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createCustomer(createData);
            setCreateData({ 
                name: '', 
                phone: '', 
                email: '', 
                address: '' 
            });
            alert('✅ Customer registered successfully!');
            navigate('/schedule');
        } catch (err) { 
            alert(`❌ ${err.message || 'Failed to register customer. Please check your data.'}`); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-500 pt-4">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1B365D] rounded-xl">
                        <Shield size={24} className="text-[#8CC63F]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1B365D] tracking-tight">Add Customer</h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wider mt-1">
                            Add a new pest control service booking
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-12">
                    <div className="w-12 h-0.5 bg-[#8CC63F] rounded-full"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Emergency Service Ready
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B365D] to-[#1B365D] p-4">
                    <div className="flex items-center gap-2">
                        <Clipboard size={16} className="text-[#8CC63F]" />
                        <p className="text-white text-xs font-black uppercase tracking-wider">
                            Booking Information
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleCreateCustomer} className="p-8 space-y-5">
                    {/* Customer Details */}
                    <InputField 
                        icon={User}
                        label="Customer Name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={createData.name}
                        onChange={e => setCreateData({...createData, name: e.target.value})}
                    />

                    <InputField 
                        icon={MapPin}
                        label="Service Address"
                        type="text"
                        required
                        placeholder="123 Example Street, Sydney NSW"
                        value={createData.address}
                        onChange={e => setCreateData({...createData, address: e.target.value})}
                    />

                    <InputField 
                        icon={Phone}
                        label="Phone Number"
                        type="tel"
                        required
                        placeholder="0400 000 000"
                        value={createData.phone}
                        onChange={e => setCreateData({...createData, phone: e.target.value})}
                    />

                    <InputField 
                        icon={Mail}
                        label="Email Address"
                        type="email"
                        required
                        placeholder="customer@example.com"
                        value={createData.email}
                        onChange={e => setCreateData({...createData, email: e.target.value})}
                    />



                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-[#1B365D] text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing Booking...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                                Register New Customer
                            </>
                        )}
                    </button>

                    {/* Safety Note */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[9px] text-gray-400 text-center flex items-center justify-center gap-1">
                            <Shield size={10} className="text-[#8CC63F]" />
                            All bookings are verified and confirmed via SMS/Email
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}