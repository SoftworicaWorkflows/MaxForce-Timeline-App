import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
    Bell, 
    CheckCircle, 
    AlertTriangle, 
    AlertCircle, 
    Info, 
    Clock, 
    Trash2, 
    Check, 
    ChevronLeft, 
    ChevronRight,
    Search
} from 'lucide-react';

const formatTimeAgo = (date) => {
    if (!date) return 'recently';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
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

export default function Notifications() {
    const { 
        notifications, 
        markAsRead, 
        clearAll, 
        loading 
    } = useNotifications();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const getIcon = (type) => {
        const iconConfig = {
            success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
            error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
            info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' }
        };
        const config = iconConfig[type] || iconConfig.info;
        const Icon = config.icon;
        return { icon: <Icon size={20} className={config.color} />, bg: config.bg, color: config.color };
    };

    // Filter notifications based on search and type
    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = 
            notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || 
            (filterType === 'unread' ? !notification.is_read : notification.type === filterType);
        return matchesSearch && matchesType;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const currentNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B365D]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-8">
            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#1B365D] to-[#1B365D] text-white rounded-xl shadow-md">
                            <Bell size={24} />
                        </div>
                        Notification Center
                    </h2>
                    <p className="text-xs text-gray-500 font-medium tracking-wider mt-2">
                        View and manage your system alerts and updates
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button 
                        onClick={clearAll}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 text-xs uppercase"
                    >
                        <Check size={16} className="text-green-600" />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Toolbar Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset page on search
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-medium text-sm"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1); // Reset page on filter change
                            }}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1B365D] outline-none transition-all cursor-pointer"
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread Only</option>
                            <option value="info">Information</option>
                            <option value="success">Success</option>
                            <option value="warning">Warnings</option>
                            <option value="error">Errors</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 flex flex-col">
                <div className="divide-y divide-gray-100 flex-1">
                    {currentNotifications.length > 0 ? (
                        currentNotifications.map((notification) => {
                            const { icon, bg } = getIcon(notification.type);
                            return (
                                <div 
                                    key={notification.id} 
                                    className={`
                                        p-5 transition-all duration-200 hover:bg-gray-50/80 group
                                        ${!notification.is_read ? 'bg-blue-50/20' : 'bg-white'}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105 ${!notification.is_read ? bg : 'bg-gray-100'}`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                <h4 className={`text-base font-bold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                                        <Clock size={12} />
                                                        {formatTimeAgo(notification.created_at)}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#8CC63F] shadow-[0_0_8px_rgba(140,198,63,0.6)] animate-pulse"></span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                                                {notification.message}
                                            </p>
                                            
                                            {/* Actions */}
                                            {!notification.is_read && (
                                                <div className="mt-3 flex items-center gap-3">
                                                    <button 
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Check size={14} />
                                                        Mark as read
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 px-6 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Bell size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications found</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                {searchTerm || filterType !== 'all' 
                                    ? "We couldn't find any notifications matching your filters. Try adjusting your search criteria."
                                    : "You're all caught up! You don't have any notifications at the moment."}
                            </p>
                            {(searchTerm || filterType !== 'all') && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                    }}
                                    className="mt-6 text-sm font-bold text-[#1B365D] hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 font-medium">
                                Showing <span className="font-bold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredNotifications.length)}</span> of <span className="font-bold text-gray-900">{filteredNotifications.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                
                                {/* Page Numbers */}
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNumber = i + 1;
                                    // Show first, last, current, and adjacent pages
                                    if (
                                        pageNumber === 1 || 
                                        pageNumber === totalPages || 
                                        Math.abs(pageNumber - currentPage) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-colors ${
                                                    currentPage === pageNumber
                                                    ? 'z-10 bg-[#1B365D] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B365D]'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 2 || 
                                        pageNumber === currentPage + 2
                                    ) {
                                        return (
                                            <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
