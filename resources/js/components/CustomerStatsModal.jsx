import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, TrendingUp, History, ClipboardCheck, Loader2, ExternalLink } from 'lucide-react';
import { getCustomerStats } from '../services/api';

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
                                        Service Timeline
                                    </h4>
                                    <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-full">{stats?.stats?.history.length || 0} Records</span>
                                </div>

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
                                                                {booking.booking_time.substring(0, 5)}
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
