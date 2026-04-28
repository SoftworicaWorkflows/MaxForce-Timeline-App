import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Phone, 
    Mail, 
    Edit2, 
    Trash2, 
    X, 
    RefreshCw, 
    PieChart, 
    PlusCircle,
    History,
    Calendar,
    MapPin,
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    DollarSign,
    Edit3
} from 'lucide-react';
import { getBookings, deleteBooking, updateBooking } from '../services/api';
import CustomerStatsModal from '../components/CustomerStatsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EditBookingModal from '../components/EditBookingModal';


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

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        booked: { color: 'bg-green-50 text-green-700', dot: 'bg-green-500', label: 'Confirmed' },
        completed: { color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'Completed' },
        cancelled: { color: 'bg-red-50 text-red-700', dot: 'bg-red-500', label: 'Cancelled' },
        pending: { color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.booked;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.color} text-[9px] font-bold uppercase tracking-wider`}>
            <div className={`w-1.5 h-1.5 ${config.dot} rounded-full`}></div>
            {config.label}
        </span>
    );
};

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [contactConfirm, setContactConfirm] = useState({ isOpen: false, type: '', value: '', title: '', message: '' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bookingToEdit, setBookingToEdit] = useState(null);
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const itemsPerPage = 7;
    
    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.phone_number?.includes(searchTerm) ||
            booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });
    
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const currentBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        fetchBookings();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getBookings();
            const bookingsData = response.bookings || [];
            
            // Sort logic: nearest date first
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            bookingsData.sort((a, b) => {
                const dateA = a.booking_date ? new Date(a.booking_date) : null;
                const dateB = b.booking_date ? new Date(b.booking_date) : null;
                
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                dateA.setHours(0, 0, 0, 0);
                dateB.setHours(0, 0, 0, 0);

                const isFutureA = dateA >= today;
                const isFutureB = dateB >= today;

                // Priority: Upcoming/Today > Past
                if (isFutureA && !isFutureB) return -1;
                if (!isFutureA && isFutureB) return 1;

                // Both future: nearest first (ascending)
                if (isFutureA && isFutureB) return dateA - dateB;
                
                // Both past: most recent first (descending)
                return dateB - dateA;
            });
            setBookings(bookingsData);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewStats = (booking) => {
        setSelectedCustomer({
            id: booking.customer_id,
            name: booking.customer_name,
            phone: booking.phone_number,
            email: booking.email,
            address: booking.address
        });
        setIsStatsModalOpen(true);
    };

    const handleEditClick = (booking) => {
        setBookingToEdit(booking);
        setIsEditModalOpen(true);
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
            await fetchBookings();
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

    const handlePhoneClick = (phone) => {
        setContactConfirm({
            isOpen: true,
            type: 'phone',
            value: phone,
            title: 'Call Customer?',
            message: `Do you want to call ${phone}?`
        });
    };

    const handleEmailClick = (email) => {
        setContactConfirm({
            isOpen: true,
            type: 'mail',
            value: email,
            title: 'Email Customer?',
            message: `Do you want to send an email to ${email}?`
        });
    };

    const handleAddressClick = (address) => {
        setContactConfirm({
            isOpen: true,
            type: 'address',
            value: address,
            title: 'Open in Maps?',
            message: `Do you want to see "${address}" on Google Maps?`
        });
    };

    const handleContactConfirm = () => {
        if (contactConfirm.type === 'phone') {
            window.location.href = `tel:${contactConfirm.value}`;
        } else if (contactConfirm.type === 'mail') {
            window.location.href = `mailto:${contactConfirm.value}`;
        } else if (contactConfirm.type === 'address') {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfirm.value)}`, '_blank');
        }
        setContactConfirm({ ...contactConfirm, isOpen: false });
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pt-4 pb-8">
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Edit Booking Modal */}
            <EditBookingModal 
                isOpen={isEditModalOpen}
                booking={bookingToEdit}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setBookingToEdit(null);
                }}
                onUpdateSuccess={() => {
                    fetchBookings();
                    showToast('Booking updated successfully', 'success');
                }}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationModal 
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setBookingToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Booking"
                message={`Are you sure you want to delete the booking for "${bookingToDelete?.customer_name}"? This action cannot be undone.`}
                confirmText="Delete Booking"
                type="warning"
                isLoading={isDeleting}
            />

            {/* Contact Confirmation Dialog */}
            <ConfirmationModal
                isOpen={contactConfirm.isOpen}
                onClose={() => setContactConfirm({ ...contactConfirm, isOpen: false })}
                onConfirm={handleContactConfirm}
                title={contactConfirm.title}
                message={contactConfirm.message}
                confirmText={
                    contactConfirm.type === 'phone' ? 'Call Now' : 
                    contactConfirm.type === 'mail' ? 'Send Email' : 'Open Maps'
                }
                type={contactConfirm.type}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
                        Customer Schedule
                    </h2>
                    <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                        Manage and monitor all customer bookings
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-gray-600">
                            Total: {bookings.length} bookings
                        </span>
                    </div>
                    <button 
                        onClick={fetchBookings} 
                        disabled={loading}
                        className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by customer name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all text-sm font-medium"
                        />
                    </div>
                    {searchTerm && (
                        <button 
                            onClick={clearFilters}
                            className="px-4 py-2.5 text-red-600 font-medium text-sm hover:bg-red-50 rounded-xl transition-all"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            </div>
            
            {loading ? (
                // Loading Skeletons
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Services</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1,2,3,4,5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : filteredBookings.length === 0 ? (
                // Empty State
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-bold text-sm mb-2">No bookings found</p>
                    <p className="text-xs text-gray-400">
                        {searchTerm 
                            ? 'Try adjusting your search query' 
                            : 'Create your first booking to get started'}
                    </p>
                    {searchTerm && (
                        <button 
                            onClick={clearFilters}
                            className="mt-4 text-[#8CC63F] text-xs font-bold uppercase tracking-wider hover:underline"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                // Bookings Table
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Date & Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Services</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBookings.map((booking, index) => (
                                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                        {/* Date & Time */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-[#8CC63F]" />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-AU', { 
                                                            day: 'numeric', 
                                                            month: 'short', 
                                                            year: 'numeric' 
                                                        }) : 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-medium mt-0.5">
                                                        {booking.start_time ? booking.start_time.substring(0, 5) : '--:--'} - {booking.end_time ? booking.end_time.substring(0, 5) : '--:--'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 capitalize">
                                                {booking.customer_name || 'N/A'}
                                            </div>
                                            {booking.address && (
                                                <button 
                                                    onClick={() => handleAddressClick(booking.address)}
                                                    className="flex items-start gap-1.5 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors group/addr text-left"
                                                >
                                                    <MapPin size={11} className="text-gray-400 group-hover/addr:text-orange-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-[10px] font-medium text-gray-500 line-clamp-2 group-hover/addr:text-orange-700">
                                                        {booking.address}
                                                    </span>
                                                </button>
                                            )}
                                        </td>
                                        
                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {booking.phone_number && (
                                                    <button 
                                                        onClick={() => handlePhoneClick(booking.phone_number)}
                                                        className="flex items-center gap-1.5 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-colors group/phone"
                                                    >
                                                        <Phone size={11} className="text-[#8CC63F] group-hover/phone:text-blue-600" />
                                                        <span className="text-xs font-medium text-gray-700 group-hover/phone:text-blue-700">{booking.phone_number}</span>
                                                    </button>
                                                )}
                                                {booking.email && (
                                                    <button 
                                                        onClick={() => handleEmailClick(booking.email)}
                                                        className="flex items-center gap-1.5 hover:bg-green-50 px-2 py-0.5 rounded-lg transition-colors group/mail"
                                                    >
                                                        <Mail size={11} className="text-gray-400 group-hover/mail:text-[#8CC63F]" />
                                                        <span className="text-[10px] font-medium text-gray-500 truncate max-w-[150px] group-hover/mail:text-green-700">
                                                            {booking.email}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Services */}
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-gray-700 max-w-xs break-words whitespace-normal">
                                                {booking.service_notes || 'General Service'}
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            {booking.price != null ? (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={12} className="text-[#8CC63F]" />
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {parseFloat(booking.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status || 'booked'} />
                                        </td>
                                        
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewStats(booking)}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200"
                                                    title="Add Service / History"
                                                >
                                                    <PlusCircle size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditClick(booking)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
                                                    title="Edit Booking"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(booking)} 
                                                    className="p-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
                                                    title="Delete Booking"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                            <span className="text-xs font-medium text-gray-500 order-2 sm:order-1">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} entries
                            </span>
                            <div className="flex gap-1 order-1 sm:order-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft size={14} />
                                    Prev
                                </button>
                                <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button 
                                                key={i} 
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                                    currentPage === pageNum 
                                                        ? 'bg-[#1B365D] text-white shadow-md' 
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-all flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Customer Stats Modal */}
            <CustomerStatsModal 
                isOpen={isStatsModalOpen} 
                customer={selectedCustomer} 
                onClose={() => {
                    setIsStatsModalOpen(false);
                    setSelectedCustomer(null);
                }} 
            />
        </div>
    );
}