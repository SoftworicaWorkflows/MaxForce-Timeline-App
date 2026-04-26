import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Loader2, Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';
import { updateBooking, checkAvailability } from '../services/api';

const EditBookingModal = ({ isOpen, booking, onClose, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        booking_date: '',
        customer_name: '',
        phone_number: '',
        email: '',
        service_notes: '',
        address: '',
        price: '',
        start_time: '',
        end_time: '',
        status: '',
        service_interval: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSlotAvailable, setIsSlotAvailable] = useState(true);
    const [checkingSlot, setCheckingSlot] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            setFormData({
                booking_date: booking.booking_date ? booking.booking_date.split('T')[0] : '',
                customer_name: booking.customer_name || '',
                phone_number: booking.phone_number || '',
                email: booking.email || '',
                service_notes: booking.service_notes || '',
                address: booking.address || '',
                price: booking.price || '',
                start_time: booking.start_time ? booking.start_time.substring(0, 5) : '',
                end_time: booking.end_time ? booking.end_time.substring(0, 5) : '',
                status: booking.status || 'booked',
                service_interval: booking.customer?.service_interval || ''
            });
            setError('');
            setSuccess(false);
        }
    }, [isOpen, booking]);

    useEffect(() => {
        if (isOpen && booking && formData.booking_date && formData.start_time && formData.end_time) {
            const timer = setTimeout(() => {
                checkSlotOverlap();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [formData.booking_date, formData.start_time, formData.end_time, isOpen]);

    const checkSlotOverlap = async () => {
        if (!formData.booking_date || !formData.start_time || !formData.end_time) return;

        if (formData.end_time <= formData.start_time) {
            setIsSlotAvailable(false);
            setError('End time must be after start time.');
            return;
        }

        setCheckingSlot(true);
        try {
            const res = await checkAvailability(
                formData.booking_date, 
                formData.start_time, 
                formData.end_time, 
                booking.id
            );
            setIsSlotAvailable(res.available);
            if (!res.available) {
                setError('⚠️ This time slot is already booked for another customer.');
            } else if (error === '⚠️ This time slot is already booked for another customer.' || error === 'End time must be after start time.') {
                setError('');
            }
        } catch (err) {
            console.error('Availability check failed', err);
        } finally {
            setCheckingSlot(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSlotAvailable) return;

        setError('');
        setLoading(true);

        try {
            const response = await updateBooking(booking.id, formData);
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onUpdateSuccess?.();
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Failed to update booking');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while updating');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-500 animate-in fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center text-[#1B365D]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8CC63F] mb-1">Edit Appointment</p>
                        <h2 className="text-2xl font-black">Update Booking</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-2xl p-3 transition-all transform hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Updated Successfully!</h3>
                                <p className="text-sm opacity-80 mt-1">The booking details have been saved.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex gap-2">
                                        <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                                        <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Date and Time Selection */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Booking Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            name="booking_date"
                                            value={formData.booking_date}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Start Time
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="time"
                                                name="start_time"
                                                value={formData.start_time}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            End Time
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="time"
                                                name="end_time"
                                                value={formData.end_time}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Customer Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="customer_name"
                                            value={formData.customer_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Price (AUD)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                step="0.01"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="booked">Booked</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Next Service Reminder
                                    </label>
                                    <select
                                        name="service_interval"
                                        value={formData.service_interval}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                    >
                                        <option value="">No Reminder</option>
                                        <option value="3w">3 Weeks Later</option>
                                        <option value="3m">3 Months Later</option>
                                        <option value="6m">6 Months Later</option>
                                        <option value="12m">12 Months Later</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Service Notes
                                    </label>
                                    <textarea
                                        name="service_notes"
                                        value={formData.service_notes}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] transition-all font-medium text-gray-900 resize-none"
                                        placeholder="Add notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !isSlotAvailable || checkingSlot}
                                    className="flex-[2] bg-[#1B365D] text-white font-bold py-3.5 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#1B365D]/20"
                                >
                                    {(loading || checkingSlot) && <Loader2 size={18} className="animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditBookingModal;
