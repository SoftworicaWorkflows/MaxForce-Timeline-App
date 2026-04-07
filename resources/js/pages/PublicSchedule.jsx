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
    Plus
} from 'lucide-react';

export default function PublicSchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [allBookings, setAllBookings] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('schedule');
    const [filterType, setFilterType] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchAllBookings();
    }, [selectedDate]);

    const fetchAllBookings = async () => {
        setLoadingSchedule(true);
        try {
            const response = await getAllBookings();
            setAllBookings(response.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoadingSchedule(false);
        }
    };

    const handleAddBooking = () => { 
        setShowModal(true); 
    };
    
    const handleBookingSuccess = () => {
        fetchAllBookings();
        setShowModal(false);
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await deleteBooking(id);
                fetchAllBookings();
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('Failed to delete booking.');
            }
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
        setSelectedDate(today.toISOString().split('T')[0]);
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
        const dateStr = date.toISOString().split('T')[0];
        return allBookings.filter(booking => booking.booking_date && booking.booking_date.split('T')[0] === dateStr);
    };

    const getFilteredBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        
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
        d.setHours(hour, min);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 bg-[#1B365D] rounded-lg sm:rounded-xl">
                                <Shield size={16} className="text-[#8CC63F] sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-4 sm:w-6 h-0.5 bg-[#8CC63F] rounded-full"></div>
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-400">
                                        Max Force Pest Control
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1B365D] mt-1">
                                    Schedule Management
                                </h1>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 bg-white rounded-xl shadow-md"
                        >
                            <MenuIcon size={20} className="text-[#1B365D]" />
                        </button>

                        {/* Desktop View Toggle */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => setViewMode('schedule')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    viewMode === 'schedule'
                                        ? 'bg-[#1B365D] text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Calendar size={16} className="inline mr-2" />
                                Calendar
                            </button>
                            <button
                                onClick={() => setViewMode('bookings')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    viewMode === 'bookings'
                                        ? 'bg-[#1B365D] text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Users size={16} className="inline mr-2" />
                                Bookings
                            </button>
                            <button
                                onClick={handleAddBooking}
                                className="ml-4 px-6 py-2.5 bg-[#8CC63F] text-[#1B365D] rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 border-2 border-[#8CC63F]"
                            >
                                <Plus size={18} />
                                Schedule Now
                            </button>
                        </div>
                    </div>

                    {/* Mobile View Toggle */}
                    {mobileMenuOpen && (
                        <div className="md:hidden flex gap-2 mt-3 p-3 bg-white rounded-xl shadow-lg">
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
                    )}
                    
                    <div className="md:hidden mt-3">
                        <button
                            onClick={handleAddBooking}
                            className="w-full py-4 bg-[#8CC63F] text-[#1B365D] rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Schedule New Appointment
                        </button>
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
                                            className="p-1.5 sm:p-2 bg-white/10 rounded-lg hover:bg-white/20"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={goToToday}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8CC63F] text-[#1B365D] rounded-lg font-bold text-xs sm:text-sm"
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={goToNextMonth}
                                            className="p-1.5 sm:p-2 bg-white/10 rounded-lg hover:bg-white/20"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 sm:p-6 overflow-x-auto hide-scrollbar">
                                {/* Week Days */}
                                <div className="grid grid-cols-7 border-b border-gray-100 min-w-[280px]">
                                    {weekDays.map(day => (
                                        <div key={day} className="text-center font-black text-[8px] sm:text-xs text-gray-400 uppercase py-2 sm:py-3 border-r border-gray-100 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days */}
                                <div className="grid grid-cols-7 min-w-[280px] border-l border-gray-50">
                                    {daysInMonth.map(({ date, isCurrentMonth }, index) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                                        const isSelected = dateStr === selectedDate;
                                        const bookings = getBookingsForDate(date);
                                        const hasBookings = bookings.length > 0;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (isCurrentMonth) {
                                                        setSelectedDate(dateStr);
                                                        setCurrentDate(date);
                                                    }
                                                }}
                                                className={`
                                                    relative p-2 sm:p-4 text-center transition-all border-r border-b border-gray-50
                                                    ${index % 7 === 6 ? 'border-r-0' : ''}
                                                    ${isSelected 
                                                        ? 'bg-[#1B365D] text-white z-10 shadow-inner' 
                                                        : isCurrentMonth 
                                                            ? hasBookings ? 'bg-[#8CC63F]/15 text-[#1B365D] hover:bg-[#8CC63F]/25 font-bold' : 'hover:bg-gray-50 text-gray-700' 
                                                            : 'text-gray-200 cursor-not-allowed opacity-40 bg-gray-50/30'
                                                    }
                                                    ${isToday && !isSelected ? 'ring-inset ring-2 ring-[#8CC63F]' : ''}
                                                `}
                                                disabled={!isCurrentMonth}
                                            >
                                                <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                                                    {date.getDate()}
                                                </span>
                                                
                                                {hasBookings && !isSelected && isCurrentMonth && (
                                                    <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 transform -translate-x-1/2">
                                                        <div className="w-1 h-1 rounded-full bg-[#8CC63F]"></div>
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
                                    <p className="text-sm sm:text-lg font-black text-[#1B365D] truncate">
                                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                                            weekday: 'short',
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAddBooking}
                                        className="px-3 py-1.5 bg-[#1B365D] text-white text-[10px] sm:text-xs font-black rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                                    >
                                        <span>+ Add Booking</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Day Schedule Summary */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-[#1B365D]" />
                                <h3 className="text-lg font-black text-[#1B365D]">Bookings on this day</h3>
                            </div>
                            
                            {loadingSchedule ? (
                                <p className="text-gray-400 text-sm">Loading...</p>
                            ) : todaysBookings.length === 0 ? (
                                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                                    No bookings scheduled for this date. Click 'Add Booking' to schedule one.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todaysBookings.map(booking => (
                                        <div key={booking.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-[#1B365D]">{booking.customer_name}</h4>
                                                <p className="text-xs text-gray-500">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                                                {booking.status === 'blocked' && (
                                                    <span className="mt-1 inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Blocked Time</span>
                                                )}
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-600 font-bold">{booking.phone_number !== 'N/A' ? booking.phone_number : ''}</p>
                                                    <p className="text-[10px] text-gray-400 capitalize">{booking.status}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                                
                                {/* Filter Buttons - Horizontal Scroll on Mobile */}
                                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mb-1 sm:mb-0 hide-scrollbar">
                                    {['all', 'today', 'future', 'past'].map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setFilterType(filter)}
                                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                                                filterType === filter
                                                    ? 'bg-[#8CC63F] text-[#1B365D]'
                                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                        >
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-6">
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                    <Calendar size={32} className="text-gray-300 mx-auto mb-2 sm:w-12 sm:h-12" />
                                    <p className="text-gray-400 font-medium text-sm sm:text-base">No bookings found</p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {filteredBookings.map((booking, index) => {
                                        const bDate = booking.booking_date ? booking.booking_date.split('T')[0] : '';
                                        const isPast = bDate < new Date().toISOString().split('T')[0];
                                        const isToday = bDate === new Date().toISOString().split('T')[0];
                                        
                                        return (
                                            <div key={index} className={`
                                                p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all
                                                ${isPast ? 'bg-gray-50 border-gray-200' : ''}
                                                ${isToday ? 'border-[#8CC63F] bg-[#8CC63F]/5' : 'border-gray-100'}
                                            `}>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`
                                                                w-1.5 h-1.5 rounded-full
                                                                ${isPast ? 'bg-gray-400' : isToday ? 'bg-[#8CC63F] animate-pulse' : 'bg-[#1B365D]'}
                                                            `}></div>
                                                            <span className={`
                                                                text-[9px] sm:text-xs font-black uppercase
                                                                ${isPast ? 'text-gray-400' : isToday ? 'text-[#8CC63F]' : 'text-[#1B365D]'}
                                                            `}>
                                                                {isPast ? 'Completed' : isToday ? 'Today' : 'Upcoming'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-[#1B365D] text-white px-2 py-0.5 rounded text-[9px] sm:text-xs font-black">
                                                                #{booking.id || index + 1}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteBooking(booking.id)}
                                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <h4 className="text-sm sm:text-lg font-black text-[#1B365D] break-words flex items-center gap-2">
                                                        {booking.customer_name}
                                                        {booking.status === 'blocked' && (
                                                            <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Blocked</span>
                                                        )}
                                                    </h4>
                                                    
                                                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Calendar size={12} className="text-[#8CC63F]" />
                                                            <span>{booking.booking_date ? booking.booking_date.split('T')[0] : ''}</span>
                                                            <Clock size={12} className="text-[#8CC63F] ml-1" />
                                                            <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                                                        </div>
                                                        {booking.status !== 'blocked' && (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Phone size={12} className="text-[#8CC63F]" />
                                                                <span className="break-words">{booking.phone_number}</span>
                                                                <Mail size={12} className="text-[#8CC63F] ml-1" />
                                                                <span className="break-words">{booking.email}</span>
                                                            </div>
                                                        )}
                                                        {booking.service_notes && (
                                                            <div className="flex items-start gap-2 text-gray-500 mt-1">
                                                                <MapPin size={12} className="text-[#8CC63F] mt-0.5 flex-shrink-0" />
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