import React, { useState, useEffect } from 'react';
import { getSchedule, getBookings as getAllBookings, deleteBooking } from '../services/api';
import BookingModal from '../components/BookingModal.jsx';
import { 
    Calendar, 
    Clock, 
    Shield,
    ChevronLeft,
    ChevronRight,
    Users,
    MapPin,
    Phone,
    Mail,
    Menu as MenuIcon,
    Trash2,
    Plus,
    X,
    AlertCircle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Booking'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
        <div className={`rounded-xl p-4 shadow-lg flex items-center gap-3 ${
            type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
            {type === 'success' ? (
                <CheckCircle size={20} className="text-green-600" />
            ) : (
                <AlertCircle size={20} className="text-red-600" />
            )}
            <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message}
            </p>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={16} />
            </button>
        </div>
    </div>
);

export default function PublicSchedule() {
    const formatLocalYYYYMMDD = (dateObj) => {
        const d = new Date(dateObj);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatLocalYYYYMMDD(new Date()));
    const [allBookings, setAllBookings] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('schedule');
    const [filterType, setFilterType] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAllBookings = async () => {
        setLoadingSchedule(true);
        try {
            const response = await getAllBookings();
            setAllBookings(response.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('Failed to load bookings', 'error');
        } finally {
            setLoadingSchedule(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAllBookings();
    };

    const handleAddBooking = () => { 
        setShowModal(true); 
    };
    
    const handleBookingSuccess = () => {
        fetchAllBookings();
        setShowModal(false);
        showToast('Booking created successfully', 'success');
    };

    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!bookingToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteBooking(bookingToDelete.id);
            await fetchAllBookings();
            showToast(`Booking for "${bookingToDelete.customer_name}" has been deleted`, 'success');
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
        } catch (error) {
            console.error('Error deleting booking:', error);
            showToast(error.message || 'Failed to delete booking', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(formatLocalYYYYMMDD(today));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        const startDay = firstDay.getDay();
        for (let i = startDay - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateObj = new Date(year, month, i);
            days.push({ date: dateObj, isCurrentMonth: true });
        }
        
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({ date: nextDate, isCurrentMonth: false });
        }
        
        return days;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getBookingsForDate = (date) => {
        const dateStr = formatLocalYYYYMMDD(date);
        return allBookings.filter(booking => booking.booking_date && booking.booking_date.split('T')[0] === dateStr);
    };

    const getFilteredBookings = () => {
        const today = formatLocalYYYYMMDD(new Date());
        
        switch(filterType) {
            case 'past':
                return allBookings.filter(booking => booking.booking_date && booking.booking_date.split('T')[0] < today);
            case 'future':
                return allBookings.filter(booking => booking.booking_date && booking.booking_date.split('T')[0] > today);
            case 'today':
                return allBookings.filter(booking => booking.booking_date && booking.booking_date.split('T')[0] === today);
            default:
                return allBookings;
        }
    };

    const filteredBookings = getFilteredBookings();
    const todaysBookings = getBookingsForDate(new Date(selectedDate));

    // Helper to format time strings from 09:00:00 to 09:00 AM
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hour, min] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hour), parseInt(min));
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Get stats
    const stats = {
        total: allBookings.length,
        today: getBookingsForDate(new Date()).length,
        upcoming: allBookings.filter(b => b.booking_date && b.booking_date.split('T')[0] > formatLocalYYYYMMDD(new Date())).length
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog 
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setBookingToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Booking"
                message={`Are you sure you want to delete the booking for "${bookingToDelete?.customer_name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />

            <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 bg-[#1B365D] rounded-lg sm:rounded-xl shadow-md">
                                <Shield size={16} className="text-[#8CC63F] sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-4 sm:w-6 h-0.5 bg-[#8CC63F] rounded-full"></div>
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500">
                                        Max Force Pest Control
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mt-1">
                                    Schedule Management
                                </h1>
                            </div>
                        </div>

                        {/* Stats Summary - Desktop */}
                        <div className="hidden md:flex gap-3">
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                                <span className="text-[10px] text-gray-500">Total</span>
                                <span className="ml-1 text-sm font-bold text-gray-900">{stats.total}</span>
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                                <span className="text-[10px] text-gray-500">Today</span>
                                <span className="ml-1 text-sm font-bold text-green-600">{stats.today}</span>
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                                <span className="text-[10px] text-gray-500">Upcoming</span>
                                <span className="ml-1 text-sm font-bold text-blue-600">{stats.upcoming}</span>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 bg-white rounded-xl shadow-md border border-gray-200"
                        >
                            <MenuIcon size={20} className="text-gray-700" />
                        </button>

                        {/* Desktop View Toggle */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => setViewMode('schedule')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    viewMode === 'schedule'
                                        ? 'bg-[#1B365D] text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <Calendar size={16} />
                                Calendar
                            </button>
                            <button
                                onClick={() => setViewMode('bookings')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    viewMode === 'bookings'
                                        ? 'bg-[#1B365D] text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <Users size={16} />
                                Bookings
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                            </button>
                            <button
                                onClick={handleAddBooking}
                                className="ml-2 px-5 py-2 bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                New Booking
                            </button>
                        </div>
                    </div>

                    {/* Mobile View Toggle */}
                    {mobileMenuOpen && (
                        <div className="md:hidden space-y-3 mt-3 p-3 bg-white rounded-xl shadow-lg border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setViewMode('schedule');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                                        viewMode === 'schedule'
                                            ? 'bg-[#1B365D] text-white'
                                            : 'bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <Calendar size={14} className="inline mr-1" />
                                    Calendar
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('bookings');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                                        viewMode === 'bookings'
                                            ? 'bg-[#1B365D] text-white'
                                            : 'bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <Users size={14} className="inline mr-1" />
                                    Bookings
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    handleAddBooking();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full py-3 bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                New Booking
                            </button>
                        </div>
                    )}
                    
                    {/* Mobile Stats */}
                    <div className="md:hidden grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-white p-2 rounded-lg text-center shadow-sm border border-gray-100">
                            <p className="text-[8px] text-gray-500 uppercase">Total</p>
                            <p className="text-sm font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg text-center shadow-sm border border-gray-100">
                            <p className="text-[8px] text-gray-500 uppercase">Today</p>
                            <p className="text-sm font-bold text-green-600">{stats.today}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg text-center shadow-sm border border-gray-100">
                            <p className="text-[8px] text-gray-500 uppercase">Upcoming</p>
                            <p className="text-sm font-bold text-blue-600">{stats.upcoming}</p>
                        </div>
                    </div>
                </div>

                {viewMode === 'schedule' ? (
                    <>
                        {/* Calendar Section */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-[#1B365D] to-[#1B365D] p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg sm:text-2xl font-black text-white">
                                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <p className="text-white/70 text-xs sm:text-sm mt-1">
                                            Select a date to view and manage appointments
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={goToPreviousMonth}
                                            className="p-1.5 sm:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={goToToday}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8CC63F] text-[#1B365D] rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg transition-all"
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={goToNextMonth}
                                            className="p-1.5 sm:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 sm:p-6 overflow-x-auto hide-scrollbar">
                                {/* Week Days */}
                                <div className="grid grid-cols-7 border-b border-gray-100 min-w-[280px]">
                                    {weekDays.map(day => (
                                        <div key={day} className="text-center font-black text-[8px] sm:text-xs text-gray-500 uppercase py-2 sm:py-3 border-r border-gray-100 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days */}
                                <div className="grid grid-cols-7 min-w-[280px]">
                                    {daysInMonth.map(({ date, isCurrentMonth }, index) => {
                                        const dateStr = formatLocalYYYYMMDD(date);
                                        const isToday = dateStr === formatLocalYYYYMMDD(new Date());
                                        const isSelected = dateStr === selectedDate;
                                        const bookings = getBookingsForDate(date);
                                        const hasBookings = bookings.length > 0;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (isCurrentMonth) {
                                                        setSelectedDate(dateStr);
                                                    }
                                                }}
                                                className={`
                                                    relative p-2 sm:p-4 text-center transition-all border-r border-b border-gray-50
                                                    ${index % 7 === 6 ? 'border-r-0' : ''}
                                                    ${isSelected 
                                                        ? 'bg-[#1B365D] text-white z-10 shadow-inner' 
                                                        : isCurrentMonth 
                                                            ? hasBookings ? 'bg-[#8CC63F]/10 text-gray-900 hover:bg-[#8CC63F]/20 font-semibold' : 'hover:bg-gray-50 text-gray-700' 
                                                            : 'text-gray-300 cursor-not-allowed bg-gray-50/30'
                                                    }
                                                    ${isToday && !isSelected && isCurrentMonth ? 'ring-2 ring-[#8CC63F] ring-inset' : ''}
                                                `}
                                                disabled={!isCurrentMonth}
                                            >
                                                <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                                                    {date.getDate()}
                                                </span>
                                                
                                                {hasBookings && !isSelected && isCurrentMonth && (
                                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F]"></div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Selected Date Info */}
                        <div className="bg-gradient-to-r from-[#8CC63F]/10 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#8CC63F]/20 mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Calendar size={16} className="text-[#8CC63F] sm:w-5 sm:h-5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase">Selected Date</p>
                                    <p className="text-sm sm:text-lg font-black text-gray-900 truncate">
                                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            month: 'long', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleAddBooking}
                                    className="px-3 py-1.5 bg-[#1B365D] text-white text-[10px] sm:text-xs font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                                >
                                    <Plus size={14} />
                                    Add Booking
                                </button>
                            </div>
                        </div>
                        
                        {/* Day Schedule Summary */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-gray-700" />
                                <h3 className="text-base sm:text-lg font-black text-gray-900">Bookings on this day</h3>
                                <span className="text-xs text-gray-500">({todaysBookings.length})</span>
                            </div>
                            
                            {loadingSchedule ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : todaysBookings.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-200 text-center">
                                    <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No bookings scheduled for this date</p>
                                    <p className="text-xs text-gray-400 mt-1">Click 'Add Booking' to schedule one</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todaysBookings.map(booking => (
                                        <div key={booking.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="font-bold text-gray-900">{booking.customer_name}</h4>
                                                        {booking.status === 'blocked' && (
                                                            <span className="inline-block bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                Blocked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                                        </span>
                                                        {booking.phone_number && booking.phone_number !== 'N/A' && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={12} />
                                                                {booking.phone_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {booking.service_notes && (
                                                        <p className="text-xs text-gray-500 mt-2 line-clamp-1">{booking.service_notes}</p>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteClick(booking)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all self-start sm:self-center"
                                                    title="Delete Booking"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Bookings View */
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1B365D] to-[#1B365D] p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg sm:text-2xl font-black text-white">All Bookings</h3>
                                    <p className="text-white/70 text-xs sm:text-sm">Total: {allBookings.length} appointments</p>
                                </div>
                                
                                {/* Filter Buttons */}
                                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'today', label: 'Today' },
                                        { key: 'future', label: 'Upcoming' },
                                        { key: 'past', label: 'Past' }
                                    ].map(filter => (
                                        <button
                                            key={filter.key}
                                            onClick={() => setFilterType(filter.key)}
                                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                                                filterType === filter.key
                                                    ? 'bg-[#8CC63F] text-[#1B365D] shadow-md'
                                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-6">
                            {loadingSchedule ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                    <Calendar size={32} className="text-gray-300 mx-auto mb-2 sm:w-12 sm:h-12" />
                                    <p className="text-gray-400 font-medium text-sm sm:text-base">No bookings found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different filter or create a new booking</p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {filteredBookings.map((booking) => {
                                        const bDate = booking.booking_date ? booking.booking_date.split('T')[0] : '';
                                        const isPast = bDate < formatLocalYYYYMMDD(new Date());
                                        const isToday = bDate === formatLocalYYYYMMDD(new Date());
                                        
                                        return (
                                            <div key={booking.id} className={`
                                                p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all hover:shadow-md
                                                ${isPast ? 'bg-gray-50 border-gray-200 opacity-75' : ''}
                                                ${isToday ? 'border-[#8CC63F] bg-[#8CC63F]/5 shadow-md' : 'border-gray-100'}
                                            `}>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`
                                                                w-1.5 h-1.5 rounded-full
                                                                ${isPast ? 'bg-gray-400' : isToday ? 'bg-[#8CC63F] animate-pulse' : 'bg-blue-500'}
                                                            `}></div>
                                                            <span className={`
                                                                text-[9px] sm:text-xs font-bold uppercase
                                                                ${isPast ? 'text-gray-500' : isToday ? 'text-[#8CC63F]' : 'text-blue-600'}
                                                            `}>
                                                                {isPast ? 'Completed' : isToday ? 'Today' : 'Upcoming'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px] sm:text-xs font-bold">
                                                                #{String(booking.id).slice(0, 8)}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteClick(booking)}
                                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="text-sm sm:text-base font-black text-gray-900 break-words flex items-center gap-2 flex-wrap">
                                                        {booking.customer_name}
                                                        {booking.status === 'blocked' && (
                                                            <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                Blocked
                                                            </span>
                                                        )}
                                                    </h4>
                                                    
                                                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <span className="font-medium">
                                                                {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-AU', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                }) : ''}
                                                            </span>
                                                            <Clock size={12} className="text-gray-400 ml-1" />
                                                            <span className="font-medium">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                                                        </div>
                                                        {booking.status !== 'blocked' && (
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                {booking.phone_number && booking.phone_number !== 'N/A' && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone size={12} className="text-gray-400" />
                                                                        <span className="break-words text-xs">{booking.phone_number}</span>
                                                                    </div>
                                                                )}
                                                                {booking.email && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Mail size={12} className="text-gray-400" />
                                                                        <span className="break-words text-xs truncate max-w-[200px]">{booking.email}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {booking.service_notes && (
                                                            <div className="flex items-start gap-2 text-gray-500 mt-1">
                                                                <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <span className="break-words text-xs">{booking.service_notes}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Booking Modal */}
                <BookingModal 
                    isOpen={showModal} 
                    selectedDate={selectedDate} 
                    onClose={() => setShowModal(false)} 
                    onBookingSuccess={handleBookingSuccess} 
                />
            </div>
        </div>
    );
}