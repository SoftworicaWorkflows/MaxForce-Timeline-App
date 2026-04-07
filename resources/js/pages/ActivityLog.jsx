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
    Search,
    RefreshCw
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
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
};

// Format full date for tooltip
const formatFullDate = (date) => {
    return new Date(date).toLocaleString('en-AU', {
        dateStyle: 'full',
        timeStyle: 'medium'
    });
};

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isProcessing }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bell size={24} className="text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-[#1B365D] text-white font-semibold rounded-xl hover:bg-[#1B365D]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                'Mark All as Read'
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

export default function ActivityLog() {
    const [notifications, setNotifications] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActivity();
    }, [page, filter]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const data = await getNotifications(true, page);
            setNotifications(data.notifications.data || []);
            setPagination(data.notifications);
        } catch (error) {
            console.error('Error fetching activity:', error);
            showToast('Failed to load activity log', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchActivity();
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            showToast('Notification marked as read', 'success');
        } catch (error) {
            console.error('Error marking as read:', error);
            showToast('Failed to mark notification as read', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        setIsProcessing(true);
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            showToast('All notifications marked as read', 'success');
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast('Failed to mark all as read', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'error': return <AlertCircle className="text-red-500" size={20} />;
            case 'info':
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        const matchesFilter = filter === 'all' || 
            (filter === 'unread' && !notification.is_read);
        
        const matchesSearch = searchTerm === '' || 
            notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-8">
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog 
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleMarkAllAsRead}
                title="Mark All as Read"
                message={`Are you sure you want to mark all ${unreadCount} unread notifications as read?`}
                isProcessing={isProcessing}
            />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        System Activity Log
                    </h2>
                    <p className="text-xs text-gray-500 font-medium tracking-wider mt-1">
                        History of all system notifications and events
                    </p>
                </div>
                <div className="flex gap-3">
                    {unreadCount > 0 && (
                        <button 
                            onClick={() => setConfirmDialogOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs shadow-sm"
                        >
                            <Check size={16} />
                            Mark All Read ({unreadCount})
                        </button>
                    )}
                    <button 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 bg-[#1B365D] text-white rounded-xl shadow-lg hover:shadow-[#1B365D]/20 transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
                            <FilterButton 
                                active={filter === 'all'} 
                                onClick={() => {
                                    setFilter('all');
                                    setPage(1);
                                }}
                            >
                                All
                            </FilterButton>
                            <FilterButton 
                                active={filter === 'unread'} 
                                onClick={() => {
                                    setFilter('unread');
                                    setPage(1);
                                }}
                            >
                                Unread {unreadCount > 0 && `(${unreadCount})`}
                            </FilterButton>
                        </div>
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by title or description..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm font-medium transition-all"
                            />
                        </div>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="px-3 py-2.5 text-red-600 font-medium text-sm hover:bg-red-50 rounded-xl transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="px-5 py-3 bg-white border-b border-gray-100">
                    <div className="flex gap-4 text-xs">
                        <span className="text-gray-500">
                            Total: <span className="font-bold text-gray-900">{pagination?.total || 0}</span>
                        </span>
                        <span className="text-gray-500">
                            Unread: <span className="font-bold text-amber-600">{unreadCount}</span>
                        </span>
                        <span className="text-gray-500">
                            Showing: <span className="font-bold text-gray-900">{filteredNotifications.length}</span>
                        </span>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading history...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`
                                        p-5 flex gap-4 items-start transition-all duration-300 hover:bg-gray-50
                                        ${notification.is_read ? 'bg-white opacity-75' : 'bg-white'}
                                    `}
                                >
                                    <div className={`
                                        p-2.5 rounded-xl flex-shrink-0 shadow-sm
                                        ${notification.is_read ? 'bg-gray-100' : 'bg-gray-100'}
                                    `}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className={`text-sm font-bold tracking-tight ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <div 
                                                className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium cursor-help"
                                                title={formatFullDate(notification.created_at)}
                                            >
                                                <Clock size={11} />
                                                {formatTimeAgo(notification.created_at)}
                                            </div>
                                        </div>
                                        <p className={`text-xs leading-relaxed mb-2.5 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                                            {notification.message}
                                        </p>
                                        {!notification.is_read && (
                                            <button 
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="text-[10px] font-bold text-green-600 uppercase tracking-wider hover:underline flex items-center gap-1.5 transition-colors"
                                            >
                                                <Check size={11} />
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-base mb-2">No activity found</h3>
                            <p className="text-gray-400 text-sm">
                                {searchTerm || filter !== 'all' 
                                    ? 'Try adjusting your filters or search terms' 
                                    : 'No notifications have been recorded yet'}
                            </p>
                            {(searchTerm || filter !== 'all') && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilter('all');
                                    }}
                                    className="mt-4 text-green-600 text-xs font-bold uppercase tracking-wider hover:underline"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {pagination && pagination.last_page > 1 && filteredNotifications.length > 0 && (
                    <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-600 font-medium order-2 sm:order-1">
                            Showing <span className="font-bold text-gray-900">{pagination.from}-{pagination.to}</span> of <span className="font-bold text-gray-900">{pagination.total}</span> entries
                        </p>
                        <div className="flex gap-2 order-1 sm:order-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:border-gray-300 transition-all disabled:hover:border-gray-200"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center px-4 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 min-w-[70px] justify-center">
                                Page {page} of {pagination.last_page}
                            </div>
                            <button 
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:border-gray-300 transition-all disabled:hover:border-gray-200"
                            >
                                <ChevronRight size={16} />
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
        className={`px-5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
            active 
                ? 'bg-[#1B365D] text-white shadow-md' 
                : 'text-gray-500 hover:text-[#1B365D] hover:bg-gray-50'
        }`}
    >
        {children}
    </button>
);