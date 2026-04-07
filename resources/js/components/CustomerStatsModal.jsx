import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, TrendingUp, History, ClipboardCheck, Loader2, ExternalLink, Plus } from 'lucide-react';
import { getCustomerStats, createBooking } from '../services/api';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-opacity-10 ${colorClass}`}>
                <Icon size={18} className={colorClass.replace('bg-opacity-10', 'text-opacity-100').replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">{label}</p>
                <p className="text-lg font-black text-[#1B365D] leading-none">{value}</p>
            </div>
        </div>
    </div>
);

const MiniChart = ({ data }) => {
    const max = Math.max(...data, 1);
    const height = 40;
    const width = 100;
    const step = width / (data.length - 1 || 1);
    
    const points = data.map((v, i) => `${i * step},${height - (v / max * height)}`).join(' ');
    
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-10 overflow-visible">
            <polyline
                fill="none"
                stroke="#8CC63F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="drop-shadow-[0_2px_4px_rgba(140,198,63,0.3)]"
            />
        </svg>
    );
};

export default function CustomerStatsModal({ isOpen, customer, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({
        service_notes: ''
    });
    const [submittingService, setSubmittingService] = useState(false);
    const [showAdded, setShowAdded] = useState(false);
    const [addError, setAddError] = useState('');

    useEffect(() => {
        if (isOpen && customer) {
            fetchStats();
        }
    }, [isOpen, customer]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getCustomerStats(customer.id);
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        setSubmittingService(true);
        try {
            const today = new Date();
            const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const startHour = String(today.getHours()).padStart(2, '0');
            const startMin = String(today.getMinutes()).padStart(2, '0');
            const endHour = String((today.getHours() + 1) % 24).padStart(2, '0');
            
            const generatedStartTime = `${startHour}:${startMin}`;
            const generatedEndTime = `${endHour}:${startMin}`;
            
            await createBooking({
                customer_id: customer.id,
                customer_name: customer.name,
                phone_number: customer.phone,
                email: customer.email || 'noemail@example.com',
                address: customer.address || 'No Address Provided',
                booking_date: currentDate,
                start_time: generatedStartTime,
                end_time: generatedEndTime,
                service_notes: newService.service_notes
            });
            
            setShowAdded(true);
            setTimeout(() => setShowAdded(false), 2000);
            
            // Keeping form open for adding multiple services
            setStats(null); // Force reload
            fetchStats();
        } catch (err) {
            setAddError(err.message || 'Failed to add service');
            setTimeout(() => setAddError(''), 5000);
        } finally {
            setSubmittingService(false);
        }
    };

    if (!isOpen) return null;

    // Simulate monthly frequency for the chart
    const chartData = [2, 5, 3, 8, 4, 6, 9];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#1B365D]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#F8FAFC] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                {/* Modern Header */}
                <div className="bg-[#1B365D] p-8 text-white relative overflow-hidden">
                    {/* Abstract background pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp size={120} />
                    </div>
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                                <span className="text-3xl font-black text-[#8CC63F]">{customer?.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">{customer?.name}'s History</h3>
                                <p className="text-[#8CC63F] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                    <MapPin size={12} />
                                    {customer?.address || 'No Address Provided'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 pb-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={40} className="text-[#1B365D] animate-spin" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Service Data...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard 
                                    icon={ClipboardCheck} 
                                    label="Total Services" 
                                    value={stats?.stats?.total_services || 0} 
                                    colorClass="bg-blue-500" 
                                />
                                <StatCard 
                                    icon={TrendingUp} 
                                    label="Booking Freq" 
                                    value="High" 
                                    colorClass="bg-[#8CC63F]" 
                                />
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-2">Service Trend</p>
                                        <MiniChart data={chartData} />
                                    </div>
                                </div>
                            </div>

                            {/* Service Timeline/History List */}
                            <div>
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="flex items-center gap-2 text-[#1B365D] font-black text-sm uppercase tracking-wider">
                                        <History size={16} className="text-[#8CC63F]" />
                                        {showAddForm ? 'Add New Service' : 'Service Timeline'}
                                    </h4>
                                    {!showAddForm && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-full">{stats?.stats?.history.length || 0} Records</span>
                                            <button onClick={() => setShowAddForm(true)} className="text-[10px] bg-[#8CC63F] text-[#1B365D] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider hover:shadow-md transition-all flex items-center gap-1">
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {showAddForm && (
                                    <div className="space-y-4">
                                        {addError && (
                                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 animate-in shake duration-300">
                                                <AlertCircle size={14} />
                                                {addError}
                                            </div>
                                        )}
                                        <form onSubmit={handleAddService} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-gray-500 uppercase mb-2">Service Notes</label>
                                            <input type="text" placeholder="Add any details here..." value={newService.service_notes} onChange={e => setNewService({...newService, service_notes: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8CC63F] font-semibold" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" disabled={submittingService} className={`flex-1 ${showAdded ? 'bg-green-500 text-white' : 'bg-[#8CC63F] text-[#1B365D]'} font-black uppercase text-xs tracking-wider py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2`}>
                                                {submittingService ? <Loader2 size={14} className="animate-spin" /> : (showAdded ? <ClipboardCheck size={14} /> : <Plus size={14} />)}
                                                {showAdded ? 'Added!' : 'Save Service'}
                                            </button>
                                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 bg-gray-100 text-gray-500 font-black uppercase text-xs tracking-wider rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                                        </div>
                                    </form>
                                    </div>
                                )}

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                                    {stats?.stats?.history.length > 0 ? (
                                        stats.stats.history.map((booking, i) => (
                                            <div key={booking.id} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#8CC63F] transition-all hover:shadow-lg flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#1B365D] font-black group-hover:bg-[#1B365D] group-hover:text-white transition-all">
                                                        {stats.stats.history.length - i}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Calendar size={12} className="text-[#8CC63F]" />
                                                            <p className="text-sm font-black text-[#1B365D]">{new Date(booking.booking_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                                <Clock size={10} />
                                                                {booking.start_time ? booking.start_time.substring(0, 5) : ''} - {booking.end_time ? booking.end_time.substring(0, 5) : ''}
                                                            </div>
                                                            <span className="text-[10px] font-black text-[#8CC63F] uppercase tracking-widest px-2 py-0.5 bg-[#8CC63F]/10 rounded-lg">Pest Control</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${booking.status === 'booked' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                                                        {booking.status}
                                                    </div>
                                                    {booking.service_notes && (
                                                        <p className="text-[9px] text-gray-400 italic font-medium max-w-[150px] truncate text-right">{booking.service_notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No service record yet</p>
                                            <a href="/schedule" className="text-[#8CC63F] text-[10px] font-black uppercase mt-2 inline-block hover:underline">Book First Service</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4">
                                <button onClick={onClose} className="w-full py-4 bg-white text-[#1B365D] border-2 border-gray-100 font-black rounded-2xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    Close Service View
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
