import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { createBooking, getSuggestions, getCustomers } from '../services/api';
import { User, Search, UserPlus } from 'lucide-react';

const BookingModal = ({ isOpen, slot, selectedDate, onClose, onBookingSuccess }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        phone_number: '',
        email: '',
        service_notes: '',
    });
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCustomers();
        } else {
            resetForm();
        }
    }, [isOpen]);

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data.customers || []);
        } catch (err) {
            console.error('Failed to load customers');
        }
    };

    const resetForm = () => {
        setFormData({
            customer_name: '',
            phone_number: '',
            email: '',
            address: '',
            service_notes: '',
        });
        setSelectedCustomerId('');
        setSearchTerm('');
        setShowCustomerList(false);
        setError('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSuccess(false);
    };

    const handleSelectCustomer = (customer) => {
        setFormData({
            customer_name: customer.name,
            phone_number: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            service_notes: formData.service_notes,
        });
        setSelectedCustomerId(customer.id);
        setSearchTerm(customer.name);
        setShowCustomerList(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e, timeSlot = null) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const bookingTime = timeSlot || slot?.time;

        try {
            const bookingData = {
                customer_id: selectedCustomerId,
                booking_date: selectedDate,
                booking_time: bookingTime,
                ...formData,
            };

            const response = await createBooking(bookingData);

            if (!response.success) {
                setShowSuggestions(true);
                setError("This time slot is already booked. Please choose one of the suggested times.");
                const suggestionsResponse = await getSuggestions(selectedDate, bookingTime);
                setSuggestions(suggestionsResponse.suggestions || []);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onBookingSuccess?.();
                    onClose();
                }, 2000);
            }
        } catch (err) {
            setError('Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !slot) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-max-navy p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-white hover:bg-opacity-10 rounded-full p-2 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Status Sections */}
                    {success ? (
                        <div className="bg-max-lime bg-opacity-10 border border-max-lime text-max-navy p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-max-lime p-2 rounded-full text-white">
                                <Check size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Booking Confirmed!</h3>
                                <p className="text-sm">Your appointment has been secured.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Selected Info */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Scheduled Date:</span>
                                    <span className="font-bold text-max-navy">{selectedDate}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-500">Selected Time:</span>
                                    <span className="font-bold text-max-navy">{slot.label}</span>
                                </div>
                            </div>

                            {/* Suggestions Error */}
                            {showSuggestions && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex gap-2 mb-3">
                                        <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                                        <p className="text-sm font-medium text-red-800 leading-tight">
                                            {error}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestions.map((sugg) => (
                                            <button
                                                key={sugg.time}
                                                onClick={() => handleSubmit(null, sugg.time)}
                                                className="bg-white border border-red-100 py-2 px-3 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                            >
                                                {sugg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* Customer Selection */}
                             <div className="mb-6 relative">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    Search Customer
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Type name to find customer..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowCustomerList(true);
                                            if (!e.target.value) setSelectedCustomerId('');
                                        }}
                                        onFocus={() => setShowCustomerList(true)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:ring-2 focus:ring-max-navy focus:bg-white transition-all font-semibold"
                                    />
                                    {showCustomerList && searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                                            {customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(customer => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    onClick={() => handleSelectCustomer(customer)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                                                        <p className="text-[10px] text-gray-500">{customer.phone}</p>
                                                    </div>
                                                </button>
                                            ))}
                                            {customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center">
                                                    <p className="text-xs text-gray-400">No customer found</p>
                                                    <a href="/register" className="text-max-navy text-[10px] font-bold uppercase mt-2 inline-flex items-center gap-1 hover:underline">
                                                        <UserPlus size={10} /> Register New
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                             </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-max-navy transition-all placeholder-gray-300 font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-max-navy transition-all placeholder-gray-300 font-medium"
                                            placeholder="Ph number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-max-navy transition-all placeholder-gray-300 font-medium"
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Service Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-max-navy transition-all placeholder-gray-300 font-medium"
                                        placeholder="Address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                                        Service Note (optional)
                                    </label>
                                    <textarea
                                        name="service_notes"
                                        value={formData.service_notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-max-navy transition-all placeholder-gray-300 font-medium resize-none"
                                        placeholder="Add notes..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 border border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-max-lime text-max-navy font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-max-lime/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 size={18} className="animate-spin" />}
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
