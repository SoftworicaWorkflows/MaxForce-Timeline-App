import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus, Lock, RefreshCw, UserPlus, Phone, Mail, Calendar as CalendarIcon, Clock, Menu } from 'lucide-react';
import { getBookings, deleteBooking, blockTimeSlot, createBooking, updateBooking } from '../services/api';

const AdminDashboard = ({ isOpen, onClose }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'block'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Edit Modal State
    const [editingBooking, setEditingBooking] = useState(null);

    // Forms
    const [blockData, setBlockData] = useState({ booking_date: '', booking_time: '' });
    const [createData, setCreateData] = useState({
        booking_date: '', booking_time: '', customer_name: '', phone_number: '', email: '', service_notes: ''
    });

    useEffect(() => {
        if (isOpen) fetchBookings();
    }, [isOpen]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getBookings();
            setBookings(response.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await deleteBooking(id);
                fetchBookings();
            } catch (error) {
                console.error('Error deleting booking:', error);
            }
        }
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            await createBooking(createData);
            setCreateData({ booking_date: '', booking_time: '', customer_name: '', phone_number: '', email: '', service_notes: '' });
            setActiveTab('list');
            fetchBookings();
        } catch (error) {
            alert('Failed to create booking. Slot might be taken.');
        }
    };

    const handleBlockTimeSlot = async (e) => {
        e.preventDefault();
        try {
            await blockTimeSlot(blockData.booking_date, blockData.booking_time);
            setBlockData({ booking_date: '', booking_time: '' });
            setActiveTab('list');
            fetchBookings();
        } catch (error) {
            alert('Failed to block time slot.');
        }
    };

    const submitUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateBooking(editingBooking.id, editingBooking);
            setEditingBooking(null);
            fetchBookings();
        } catch (error) {
            alert('Failed to update booking. Conflicting time slot or invalid data.');
        }
    };

    if (!isOpen) return null;

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-4 md:px-6 md:py-4 transition-all border-l-4 font-black uppercase tracking-widest text-xs ${
                activeTab === id 
                    ? 'border-max-lime bg-max-navy bg-opacity-5 text-max-navy' 
                    : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-max-navy'
            }`}
        >
            <Icon size={18} className={activeTab === id ? 'text-max-lime' : ''} />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
            {/* Mobile Header */}
            <div className="md:hidden bg-max-navy text-white p-4 flex justify-between items-center z-20 shadow-md">
                <div className="flex items-center gap-2">
                    <Lock size={18} className="text-max-lime" />
                    <span className="font-bold text-lg">Admin View</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white bg-opacity-10 rounded-lg">
                        <Menu size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 bg-red-500 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-10 w-64 h-full bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 z-20 shadow-2xl md:shadow-none`}>
                <div className="hidden md:flex p-6 items-center justify-between border-b border-gray-50 bg-max-navy text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-max-lime p-2 rounded-lg text-max-navy">
                            <Lock size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">Admin</h2>
                            <p className="text-[9px] uppercase tracking-widest text-max-lime font-black opacity-80">Workspace</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 py-4 flex flex-col gap-1">
                    <SidebarItem id="list" icon={Clock} label="Manage Bookings" />
                    <SidebarItem id="create" icon={UserPlus} label="Add Customer" />
                    <SidebarItem id="block" icon={Lock} label="Block Slots" />
                </div>
                
                <div className="p-6 border-t border-gray-50 flex flex-col items-center">
                    <button onClick={fetchBookings} className="flex items-center gap-2 w-full justify-center p-3 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 font-bold uppercase tracking-widest text-[10px]">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 relative">
                {/* LIST / UPDATE TAB */}
                {activeTab === 'list' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-max-navy tracking-tight">Booking List</h2>
                            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">{bookings.length} total</span>
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
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking) => (
                                                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-max-navy">{booking.booking_date}</div>
                                                        <div className="text-xs text-gray-500 font-medium">{booking.booking_time}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-700">{booking.customer_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-600 flex items-center gap-2 mb-1"><Phone size={10} className="opacity-50"/> {booking.phone_number || '-'}</div>
                                                        <div className="text-xs text-gray-600 flex items-center gap-2"><Mail size={10} className="opacity-50"/> {booking.email || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                            booking.status === 'booked' ? 'bg-max-lime bg-opacity-20 text-max-navy' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => setEditingBooking(booking)} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-all">
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(booking.id)} className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CREATE CUSTOMER TAB */}
                {activeTab === 'create' && (
                    <div className="max-w-xl mx-auto animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-black text-max-navy tracking-tight mb-2">Create Customer</h2>
                            <p className="text-xs text-gray-500 font-medium mb-8">Manually add a booking into the system.</p>
                            
                            <form onSubmit={handleCreateCustomer} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                        <input type="date" required value={createData.booking_date} onChange={e => setCreateData({...createData, booking_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time</label>
                                        <input type="time" required value={createData.booking_time} onChange={e => setCreateData({...createData, booking_time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Name</label>
                                    <input type="text" required placeholder="John Doe" value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                    <input type="text" required placeholder="0400 000 000" value={createData.phone_number} onChange={e => setCreateData({...createData, phone_number: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                    <input type="email" required placeholder="email@example.com" value={createData.email} onChange={e => setCreateData({...createData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                </div>
                                <button type="submit" className="w-full mt-4 bg-max-navy text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-opacity-90 hover:shadow-lg transition-all text-xs">
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* BLOCK SLOTS TAB */}
                {activeTab === 'block' && (
                    <div className="max-w-xl mx-auto animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-black text-max-navy tracking-tight mb-2">Block Time Slot</h2>
                            <p className="text-xs text-gray-500 font-medium mb-8">Mark specific times as unavailable to users.</p>
                            
                            <form onSubmit={handleBlockTimeSlot} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date to Block</label>
                                    <input type="date" required value={blockData.booking_date} onChange={e => setBlockData({...blockData, booking_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time to Block</label>
                                    <input type="time" required value={blockData.booking_time} onChange={e => setBlockData({...blockData, booking_time: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-max-navy outline-none font-bold text-sm" />
                                </div>
                                <button type="submit" className="w-full mt-4 bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 shadow-md transition-all text-xs">
                                    Block Slot
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT MODAL OVERLAY */}
            {editingBooking && (
                <div className="fixed inset-0 bg-max-navy bg-opacity-50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-max-navy">Edit Booking #{editingBooking.id}</h3>
                            <button onClick={() => setEditingBooking(null)} className="p-2 bg-gray-50 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</label>
                                    <input type="date" required value={editingBooking.booking_date} onChange={e => setEditingBooking({...editingBooking, booking_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</label>
                                    <input type="time" required value={editingBooking.booking_time} onChange={e => setEditingBooking({...editingBooking, booking_time: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</label>
                                <input type="text" required value={editingBooking.customer_name} onChange={e => setEditingBooking({...editingBooking, customer_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                                    <input type="text" required value={editingBooking.phone_number} onChange={e => setEditingBooking({...editingBooking, phone_number: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                                    <input type="email" required value={editingBooking.email} onChange={e => setEditingBooking({...editingBooking, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                                <select value={editingBooking.status} onChange={e => setEditingBooking({...editingBooking, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm font-bold">
                                    <option value="booked">Booked</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="available">Available</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-max-lime text-max-navy py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg text-xs">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

