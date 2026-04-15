import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, TrendingUp, History, ClipboardCheck, Loader2, ExternalLink, Plus, AlertCircle, User, Phone, Mail, Award, Star, Activity, DollarSign } from 'lucide-react';
import { getCustomerStats, createBooking } from '../services/api';

const StatCard = ({ icon: Icon, label, value, colorClass, trend }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl bg-opacity-10 ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={18} className={colorClass.replace('bg-opacity-10', '').replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className={`text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
    </div>
);

const MiniChart = ({ data, color = '#8CC63F' }) => {
    const max = Math.max(...data, 1);
    const height = 40;
    const width = 100;
    const step = width / (Math.max(data.length - 1, 1));
    
    const points = data.map((v, i) => `${i * step},${height - (v / max * height)}`).join(' ');
    
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
            />
        </svg>
    );
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        booked: { color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Confirmed' },
        completed: { color: 'bg-green-50 text-green-600 border-green-100', label: 'Completed' },
        cancelled: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Cancelled' },
        pending: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.booked;
    
    return (
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${config.color}`}>
            {config.label}
        </span>
    );
};

export default function CustomerStatsModal({ isOpen, customer, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({
        service_notes: '',
        service_type: 'Pest Control'
    });
    const [submittingService, setSubmittingService] = useState(false);
    const [showAdded, setShowAdded] = useState(false);
    const [addError, setAddError] = useState('');

    useEffect(() => {
        if (isOpen && customer) {
            fetchStats();
        }
    }, [isOpen, customer]);

    useEffect(() => {
        if (showAdded) {
            const timer = setTimeout(() => setShowAdded(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showAdded]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getCustomerStats(customer.id);
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
            setStats({ stats: { total_services: 0, history: [] } });
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        
        if (!newService.service_notes.trim()) {
            setAddError('Please add service notes');
            return;
        }
        
        setSubmittingService(true);
        setAddError('');
        
        try {
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0];
            
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
                service_notes: newService.service_notes,
                service_type: newService.service_type
            });
            
            setShowAdded(true);
            setNewService({ service_notes: '', service_type: 'Pest Control' });
            await fetchStats(); // Refresh stats
            
            // Auto-close form after successful addition
            setTimeout(() => {
                setShowAddForm(false);
            }, 1500);
            
        } catch (err) {
            setAddError(err.response?.data?.message || err.message || 'Failed to add service');
        } finally {
            setSubmittingService(false);
        }
    };

    const calculateBookingFrequency = () => {
        if (!stats?.stats?.history?.length) return 'No Data';
        const bookingsPerMonth = stats.stats.history.length / 3; // Assuming 3 months
        if (bookingsPerMonth >= 2) return 'Very High';
        if (bookingsPerMonth >= 1) return 'High';
        if (bookingsPerMonth >= 0.5) return 'Medium';
        return 'Low';
    };

    const getLoyaltyLevel = () => {
        const totalServices = stats?.stats?.total_services || 0;
        if (totalServices >= 10) return { level: 'Platinum', color: 'text-purple-600', icon: Award };
        if (totalServices >= 5) return { level: 'Gold', color: 'text-yellow-600', icon: Star };
        if (totalServices >= 2) return { level: 'Silver', color: 'text-gray-500', icon: Star };
        return { level: 'Bronze', color: 'text-amber-600', icon: Star };
    };

    if (!isOpen) return null;

    const chartData = stats?.stats?.history?.slice(-6).map((_, i) => (i + 1) * (Math.random() * 2 + 1)) || [2, 5, 3, 8, 4, 6];
    const loyaltyInfo = getLoyaltyLevel();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
                {/* Modern Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 md:p-8 text-white relative overflow-hidden flex-shrink-0">
                    {/* Abstract background pattern */}
                    <div className="absolute top-0 right-0 opacity-5">
                        <TrendingUp size={160} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-black text-white">
                                    {customer?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">{customer?.name}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <p className="text-green-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                        <MapPin size={12} />
                                        {customer?.address || 'No Address Provided'}
                                    </p>
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 ${loyaltyInfo.color}`}>
                                        {loyaltyInfo.level} Member
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 self-start"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={48} className="text-gray-900 animate-spin" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Loading customer data...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Customer Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <Phone size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900">{customer?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <Mail size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400">Email</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{customer?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <User size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400">Customer Since</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <Activity size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400">Status</p>
                                        <p className="text-sm font-semibold text-green-600">Active</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard 
                                    icon={ClipboardCheck} 
                                    label="Total Services" 
                                    value={stats?.stats?.total_services || 0} 
                                    colorClass="bg-blue-500" 
                                    trend={12}
                                />
                                <StatCard 
                                    icon={TrendingUp} 
                                    label="Booking Frequency" 
                                    value={calculateBookingFrequency()} 
                                    colorClass="bg-green-500" 
                                />
                                <StatCard
                                    icon={DollarSign}
                                    label="Total Revenue"
                                    value={`$${(stats?.stats?.history || []).reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0).toFixed(2)}`}
                                    colorClass="bg-yellow-500"
                                />
                            </div>

                            {/* Service Timeline */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                    <h4 className="flex items-center gap-2 text-gray-900 font-bold text-sm uppercase tracking-wider">
                                        <History size={18} className="text-green-500" />
                                        {showAddForm ? 'Add New Service Record' : 'Service History'}
                                    </h4>
                                    {!showAddForm && (
                                        <button 
                                            onClick={() => setShowAddForm(true)} 
                                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                                        >
                                            <Plus size={14} /> Add Service
                                        </button>
                                    )}
                                </div>

                                {showAddForm && (
                                    <div className="mb-6 animate-in slide-in-from-top-3 duration-300">
                                        {addError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                                                <AlertCircle size={14} />
                                                {addError}
                                            </div>
                                        )}
                                        <form onSubmit={handleAddService} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                            <div>
                                                <label className="block text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">
                                                    Service Notes <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    placeholder="Add detailed service notes here..."
                                                    value={newService.service_notes}
                                                    onChange={e => setNewService({...newService, service_notes: e.target.value})}
                                                    rows="3"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium resize-none"
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={submittingService} 
                                                    className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                                                        showAdded 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {submittingService ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : showAdded ? (
                                                        <ClipboardCheck size={14} />
                                                    ) : (
                                                        <Plus size={14} />
                                                    )}
                                                    {showAdded ? 'Added Successfully!' : 'Save Service Record'}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setShowAddForm(false);
                                                        setAddError('');
                                                        setNewService({ service_notes: '', service_type: 'Pest Control' });
                                                    }}
                                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase text-xs tracking-wider rounded-xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Service History List */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {stats?.stats?.history?.length > 0 ? (
                                        stats.stats.history.map((booking, index) => (
                                            <div key={booking.id} className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-700 font-bold group-hover:scale-110 transition-transform">
                                                            {stats.stats.history.length - index}
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                                <Calendar size={12} className="text-green-500" />
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {new Date(booking.booking_date).toLocaleDateString('en-AU', { 
                                                                        day: 'numeric', 
                                                                        month: 'short', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </p>
                                                                <StatusBadge status={booking.status} />
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={12} />
                                                                    {booking.start_time?.substring(0, 5)} - {booking.end_time?.substring(0, 5)}
                                                                </div>
                                                                <span className="font-semibold text-green-600">
                                                                    {booking.service_type || 'Pest Control'}
                                                                </span>
                                                                {booking.price != null && (
                                                                    <span className="flex items-center gap-0.5 font-bold text-yellow-600">
                                                                        <DollarSign size={11} />
                                                                        {parseFloat(booking.price).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {booking.service_notes && (
                                                                <p className="mt-2 text-xs text-gray-500 italic border-l-2 border-green-200 pl-3">
                                                                    "{booking.service_notes}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                            <History size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No service records yet</p>
                                            <p className="text-xs text-gray-400 mt-2">Add the first service record to get started</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-200">
                                <button 
                                    onClick={onClose} 
                                    className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    Close
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

// Add this to your global CSS or component
const styles = `
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
`;