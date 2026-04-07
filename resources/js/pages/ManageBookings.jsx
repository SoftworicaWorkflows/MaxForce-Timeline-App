import React, { useState, useEffect } from 'react';
import { Clock, Phone, Mail, Edit2, Trash2, X, RefreshCw, PieChart, History } from 'lucide-react';
import { getBookings, deleteBooking, updateBooking } from '../services/api';
import CustomerStatsModal from '../components/CustomerStatsModal';

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    
    const itemsPerPage = 8;
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const currentBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        fetchAdminBookings();
    }, []);

    const fetchAdminBookings = async () => {
        setLoadingAdmin(true);
        try {
            const response = await getBookings();
            setBookings(response.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoadingAdmin(false);
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

    const handleDeleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try { await deleteBooking(id); fetchAdminBookings(); } catch (e) { console.error('Error', e); }
        }
    };

    const submitUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateBooking(editingBooking.id, editingBooking);
            setEditingBooking(null);
            fetchAdminBookings();
        } catch (e) { alert('Failed to update booking. Conflicting time slot or invalid data.'); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pt-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-max-navy tracking-tight mb-2">Customer Schedule</h2>
                    <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Overview of all chronological events</p>
                </div>
                <div className="flex gap-3">
                    <span className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 shadow-sm">{bookings.length} total entries</span>
                    <button onClick={fetchAdminBookings} className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs flex gap-2 items-center">
                        <RefreshCw size={14} className={loadingAdmin ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>
            
            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                    <Clock size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No bookings found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date & Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Services/Note</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-max-navy">{booking.booking_date ? booking.booking_date.split('T')[0] : ''}</div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                {booking.start_time ? booking.start_time.substring(0, 5) : ''} - {booking.end_time ? booking.end_time.substring(0, 5) : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700">{booking.customer_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 font-bold max-w-xs truncate">{booking.service_notes || 'General Service'}</div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                    booking.status === 'booked' ? 'bg-max-lime bg-opacity-20 text-max-navy' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewStats(booking)}
                                                    className="p-2 border border-blue-100 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                    title="View Service History"
                                                >
                                                    <PieChart size={16} />
                                                </button>
                                                <button onClick={() => setEditingBooking(booking)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                            <span className="text-xs font-bold text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, bookings.length)} of {bookings.length} entries
                            </span>
                            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-all"
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#1B365D] text-[#8CC63F] shadow-md border-transparent' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Edit Modal */}
            {editingBooking && (
                <div className="fixed inset-0 bg-max-navy bg-opacity-80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-max-navy">Edit Entry #{editingBooking.id}</h3>
                            <button onClick={() => setEditingBooking(null)} className="p-2 bg-gray-50 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</label>
                                    <input type="date" required value={editingBooking.booking_date ? editingBooking.booking_date.split('T')[0] : ''} onChange={e => setEditingBooking({...editingBooking, booking_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time (Start - End)</label>
                                    <div className="flex items-center gap-1">
                                        <input type="time" required value={editingBooking.start_time || ''} onChange={e => setEditingBooking({...editingBooking, start_time: e.target.value})} className="w-full px-2 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                                        <span className="text-gray-400">-</span>
                                        <input type="time" required value={editingBooking.end_time || ''} onChange={e => setEditingBooking({...editingBooking, end_time: e.target.value})} className="w-full px-2 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</label>
                                <input type="text" required value={editingBooking.customer_name} onChange={e => setEditingBooking({...editingBooking, customer_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                                    <input type="text" required value={editingBooking.phone_number} onChange={e => setEditingBooking({...editingBooking, phone_number: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                                    <input type="email" required value={editingBooking.email} onChange={e => setEditingBooking({...editingBooking, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                                <select value={editingBooking.status} onChange={e => setEditingBooking({...editingBooking, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold">
                                    <option value="booked">Booked</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="available">Available</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Multiple Services Message</label>
                                <textarea 
                                    rows="3"
                                    value={editingBooking.service_notes} 
                                    onChange={e => setEditingBooking({...editingBooking, service_notes: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium resize-none"
                                    placeholder="Enter multiple services or specific customer messages here..."
                                />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-max-lime text-max-navy py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg text-xs">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Customer Stats Modal */}
            <CustomerStatsModal 
                isOpen={isStatsModalOpen} 
                customer={selectedCustomer} 
                onClose={() => setIsStatsModalOpen(false)} 
            />
        </div>
    );
}
