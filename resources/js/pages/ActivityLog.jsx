import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { 
    Bell, 
    Check, 
    Trash2, 
    Clock, 
    Info, 
    CheckCircle, 
    AlertTriangle, 
    AlertCircle, 
    X,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

// Simple time ago formatter
const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

export default function ActivityLog() {
    const [notifications, setNotifications] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchActivity();
    }, [page, filter]);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const data = await getNotifications(true, page);
            // In a real app we'd filter on the backend, for demo we'll show all
            setNotifications(data.notifications.data || []);
            setPagination(data.notifications);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Mark all notifications as read?')) {
            try {
                await markAllNotificationsAsRead();
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            } catch (error) {
                console.error('Error clearing all:', error);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'error': return <AlertCircle className="text-red-500" size={20} />;
            case 'info':
            default: return <Info className="text-[#1B365D]" size={20} />;
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#1B365D] tracking-tight">System Activity Log</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        History of all system notifications and events
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs"
                    >
                        <Check size={16} />
                        Mark All Read
                    </button>
                    <button 
                        onClick={() => { setPage(1); fetchActivity(); }}
                        className="p-2.5 bg-[#1B365D] text-white rounded-xl shadow-lg hover:shadow-[#1B365D]/20 transition-all"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                {/* Filters */}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center bg-gray-50/30">
                    <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
                        <FilterButton active={filter === 'unread'} onClick={() => setFilter('unread')}>Unread</FilterButton>
                    </div>
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Filter by description..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-xs font-semibold"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading history...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`
                                        p-6 flex gap-6 items-start transition-all duration-300
                                        ${n.is_read ? 'bg-white opacity-60' : 'bg-white hover:bg-gray-50/50'}
                                    `}
                                >
                                    <div className={`
                                        p-3 rounded-2xl flex-shrink-0 shadow-sm
                                        ${n.is_read ? 'bg-gray-50' : 'bg-gray-50 border border-white'}
                                    `}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className={`text-sm font-black tracking-tight ${n.is_read ? 'text-gray-500' : 'text-[#1B365D]'}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.is_read && (
                                                    <span className="px-2 py-0.5 bg-[#8CC63F] text-[#1B365D] text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                                <Clock size={12} />
                                                {formatTimeAgo(n.created_at)}
                                            </div>
                                        </div>
                                        <p className={`text-xs leading-relaxed mb-3 ${n.is_read ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                                            {n.message}
                                        </p>
                                        {!n.is_read && (
                                            <button 
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="text-[10px] font-black text-[#8CC63F] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                            >
                                                <Check size={12} />
                                                Mark as handled
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-[#1B365D] font-black text-lg mb-2">No activity found</h3>
                            <p className="text-gray-400 text-xs font-medium">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {pagination && pagination.last_page > 1 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-bold">
                            Showing <span className="text-[#1B365D]">{pagination.from}-{pagination.to}</span> of <span className="text-[#1B365D]">{pagination.total}</span> entries
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 transition-all hover:border-[#1B365D]"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center px-4 bg-white border border-gray-200 rounded-lg text-xs font-black text-[#1B365D]">
                                {page} / {pagination.last_page}
                            </div>
                            <button 
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 transition-all hover:border-[#1B365D]"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const FilterButton = ({ active, children, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
            active ? 'bg-[#1B365D] text-white shadow-md' : 'text-gray-400 hover:text-[#1B365D] hover:bg-gray-50'
        }`}
    >
        {children}
    </button>
);
