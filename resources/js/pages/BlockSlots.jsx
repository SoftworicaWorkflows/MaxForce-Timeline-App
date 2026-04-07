import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Ban, Loader2 } from 'lucide-react';
import { blockTimeSlot } from '../services/api';

export default function BlockSlots() {
    const navigate = useNavigate();
    const [blockData, setBlockData] = useState({ 
        booking_date: '', 
        start_time: '09:00', 
        end_time: '10:00' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateTimeSlot = () => {
        if (!blockData.booking_date) {
            setError('Please select a date to block');
            return false;
        }

        const selectedDate = new Date(blockData.booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('Cannot block time slots in the past');
            return false;
        }

        if (blockData.start_time >= blockData.end_time) {
            setError('End time must be after start time');
            return false;
        }

        // Check if time slot is at least 30 minutes
        const start = new Date(`2000-01-01 ${blockData.start_time}`);
        const end = new Date(`2000-01-01 ${blockData.end_time}`);
        const diffMinutes = (end - start) / 1000 / 60;
        
        if (diffMinutes < 30) {
            setError('Time slot must be at least 30 minutes long');
            return false;
        }

        if (diffMinutes > 480) {
            setError('Time slot cannot exceed 8 hours');
            return false;
        }

        return true;
    };

    const handleBlockTimeSlot = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateTimeSlot()) {
            return;
        }

        setLoading(true);

        try {
            await blockTimeSlot(
                blockData.booking_date, 
                blockData.start_time, 
                blockData.end_time
            );
            
            setSuccess('Time slot blocked successfully!');
            
            // Reset form after successful block
            setBlockData({ 
                booking_date: '', 
                start_time: '09:00', 
                end_time: '10:00' 
            });
            
            // Auto navigate after 2 seconds
            setTimeout(() => {
                navigate('/manage');
            }, 2000);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to block time slot';
            setError(errorMessage);
            
            // Clear error after 5 seconds
            setTimeout(() => {
                setError('');
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setBlockData({ ...blockData, booking_date: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleTimeChange = (field, value) => {
        setBlockData({ ...blockData, [field]: value });
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
                {/* Header Section */}
                <div className="mb-8 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <Ban className="text-red-600" size={28} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Block Slots
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600 font-medium max-w-2xl">
                        Mark specific time slots as unavailable for bookings. This is useful for holidays, breaks, or special events.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6 md:p-8">
                                {/* Success Message */}
                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                        <p className="text-sm font-semibold text-green-700">{success}</p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                                        <p className="text-sm font-semibold text-red-700">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleBlockTimeSlot} className="space-y-6">
                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Select Date to Block
                                        </label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
                                            <input 
                                                type="date" 
                                                required 
                                                value={blockData.booking_date} 
                                                onChange={handleDateChange}
                                                min={getTodayDate()}
                                                disabled={loading}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Cannot block dates in the past
                                        </p>
                                    </div>

                                    {/* Time Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Start Time
                                            </label>
                                            <div className="relative group">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
                                                <input 
                                                    type="time" 
                                                    required 
                                                    value={blockData.start_time} 
                                                    onChange={(e) => handleTimeChange('start_time', e.target.value)}
                                                    disabled={loading}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                End Time
                                            </label>
                                            <div className="relative group">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
                                                <input 
                                                    type="time" 
                                                    required 
                                                    value={blockData.end_time} 
                                                    onChange={(e) => handleTimeChange('end_time', e.target.value)}
                                                    disabled={loading}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Slot Info */}
                                    {blockData.start_time && blockData.end_time && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Clock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-semibold text-blue-900 mb-1">Time Slot Summary</p>
                                                    <p className="text-blue-700">
                                                        Duration: {(() => {
                                                            const start = new Date(`2000-01-01 ${blockData.start_time}`);
                                                            const end = new Date(`2000-01-01 ${blockData.end_time}`);
                                                            const diffHours = (end - start) / 1000 / 60 / 60;
                                                            return `${diffHours.toFixed(1)} hours`;
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={loading || !blockData.booking_date}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Blocking Slot...
                                            </>
                                        ) : (
                                            <>
                                                <Ban size={20} />
                                                Block Time Slot
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Information Sidebar */}
                    <div className="space-y-6">
                        {/* Guidelines Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                                <Ban className="text-red-400" size={24} />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Blocking Guidelines</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Minimum block duration: 30 minutes</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Maximum block duration: 8 hours</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Cannot block time slots in the past</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                                    <span>Blocked slots will appear as unavailable to customers</span>
                                </li>
                            </ul>
                        </div>

                        {/* Quick Tips Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-amber-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                <AlertCircle className="text-amber-600" size={24} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">When to Block Slots?</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-600"></div>
                                    <span>Public holidays</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-600"></div>
                                    <span>Staff training days</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-600"></div>
                                    <span>System maintenance</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-600"></div>
                                    <span>Special private events</span>
                                </li>
                            </ul>
                        </div>

                        {/* Navigation Help */}
                        <button
                            onClick={() => navigate('/manage')}
                            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                        >
                            <XCircle size={18} />
                            Cancel & Return to Management
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}