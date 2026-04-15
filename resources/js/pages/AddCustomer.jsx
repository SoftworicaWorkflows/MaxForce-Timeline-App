import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../services/api';
import { 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    Mail, 
    Clipboard, 
    Shield, 
    CheckCircle, 
    MapPin,
    AlertCircle,
    Building,
    FileText,
    ArrowLeft,
    DollarSign
} from 'lucide-react';

const InputField = ({ 
    icon: Icon, 
    label, 
    type = "text", 
    required = false, 
    placeholder, 
    value, 
    onChange,
    error,
    step,
    pattern,
    maxLength
}) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Icon size={12} className="text-[#8CC63F]" />
            {label}
            {required && <span className="text-red-500 text-xs">*</span>}
        </label>
        <input 
            type={type} 
            required={required} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            className={`
                w-full px-4 py-3 bg-gray-50 border-2 rounded-xl outline-none font-medium text-sm 
                transition-all duration-200 hover:bg-white
                ${error 
                    ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-100 focus:ring-2 focus:ring-[#8CC63F] focus:border-[#8CC63F]'
                }
            `} 
        />
        {error && (
            <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={10} />
                {error}
            </p>
        )}
    </div>
);

export default function AddCustomer() {
    const navigate = useNavigate();
    const [createData, setCreateData] = useState({
        phone: '', 
        email: '', 
        address: '',
        price: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[\d\s\+\(\)\-]{8,20}$/;
        return phoneRegex.test(phone);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!createData.name.trim()) {
            newErrors.name = 'Customer name is required';
        } else if (createData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!createData.address.trim()) {
            newErrors.address = 'Service address is required';
        }
        
        if (!createData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(createData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        
        if (createData.email.trim() && !validateEmail(createData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            await createCustomer(createData);
            setCreateData({ 
                name: '', 
                phone: '', 
                email: '', 
                address: '',
                price: ''
            });
            alert('✅ Customer registered successfully!');
            navigate('/schedule');
        } catch (err) { 
            alert(`❌ ${err.message || 'Failed to register customer. Please check your data.'}`); 
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCreateData({...createData, [field]: value});
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({...errors, [field]: ''});
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-500 pt-4 pb-8">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#1B365D] transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-semibold">Back</span>
            </button>

            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#1B365D] to-[#1B365D] rounded-xl shadow-lg">
                        <Shield size={24} className="text-[#8CC63F]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Add Customer</h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wider mt-1">
                            Register new customer for pest control service
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-12">
                    <div className="w-12 h-0.5 bg-[#8CC63F] rounded-full"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Create New Booking
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-[#1B365D] to-[#1B365D] p-4">
                    <div className="flex items-center gap-2">
                        <Clipboard size={16} className="text-[#8CC63F]" />
                        <p className="text-white text-xs font-black uppercase tracking-wider">
                            Customer Information
                        </p>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-[#8CC63F] rounded-full animate-pulse"></div>
                            <span className="text-[8px] text-white/70 font-bold uppercase">Required fields</span>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleCreateCustomer} className="p-6 md:p-8 space-y-5">
                    {/* Customer Name */}
                    <InputField 
                        icon={User}
                        label="Customer Name"
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={createData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        error={errors.name}
                        maxLength={100}
                    />

                    {/* Service Address */}
                    <InputField 
                        icon={MapPin}
                        label="Service Address"
                        type="text"
                        required
                        placeholder="Street address, suburb, postcode"
                        value={createData.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                        error={errors.address}
                        maxLength={200}
                    />

                    {/* Phone Number */}
                    <InputField 
                        icon={Phone}
                        label="Phone Number"
                        type="tel"
                        required
                        placeholder="0400 000 000"
                        value={createData.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
                        error={errors.phone}
                        pattern="[0-9\s\+\(\)\-]{8,20}"
                        maxLength={20}
                    />

                    {/* Email Address */}
                    <InputField 
                        icon={Mail}
                        label="Email Address (Optional)"
                        type="email"
                        placeholder="customer@example.com"
                        value={createData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        maxLength={100}
                    />


                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white py-4 rounded-xl font-black uppercase tracking-wider hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing Registration...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                                Register & Continue to Scheduling
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}