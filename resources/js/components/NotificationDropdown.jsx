import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertTriangle, AlertCircle, X, Settings } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// Simple time ago formatter to avoid date-fns dependency issues
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

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getIcon = (type) => {
        const iconConfig = {
            success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
            error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
            info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' }
        };
        
        const config = iconConfig[type] || iconConfig.info;
        const Icon = config.icon;
        
        return { icon: <Icon size={16} className={config.color} />, bg: config.bg };
    };

    const { icon, bg } = getIcon(notification.type);

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.id);
        }
    };

    return (
        <div 
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                p-4 transition-all duration-200 cursor-pointer 
                border-b border-gray-100 flex gap-3 relative group
                ${notification.is_read 
                    ? 'bg-white hover:bg-gray-50' 
                    : 'bg-blue-50/30 hover:bg-blue-50/50'
                }
            `}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                }
            }}
        >
            <div className={`p-2 rounded-xl flex-shrink-0 transition-all ${notification.is_read ? 'bg-gray-100' : bg}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h5 className={`text-xs font-bold truncate ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                    </h5>
                    {!notification.is_read && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0 ml-2" />
                    )}
                </div>
                <p className={`text-[11px] line-clamp-2 leading-relaxed mb-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notification.message}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-medium">
                        <Clock size={10} />
                        {formatTimeAgo(notification.created_at)}
                    </div>
                    {isHovered && onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-500"
                            aria-label="Delete notification"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationSkeleton = () => (
    <div className="p-4 border-b border-gray-100 flex gap-3 animate-pulse">
        <div className="p-2 rounded-xl bg-gray-100 w-8 h-8" />
        <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-2 bg-gray-50 rounded w-full mb-1" />
            <div className="h-2 bg-gray-50 rounded w-2/3" />
        </div>
    </div>
);

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'service'
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        clearAll, 
        deleteNotification,
        loading 
    } = useNotifications();
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Update local unread count and filtered notifications
    useEffect(() => {
        const count = notifications.filter(n => !n.is_read).length;
        setLocalUnreadCount(count);

        if (activeTab === 'service') {
            setFilteredNotifications(notifications.filter(n => n.category === 'service'));
        } else {
            setFilteredNotifications(notifications);
        }
    }, [notifications, activeTab]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    // Prevent body scroll when dropdown is open
    useEffect(() => {
        if (isOpen) {
            const handleWheel = (e) => {
                const dropdownContent = dropdownRef.current?.querySelector('.dropdown-content');
                if (dropdownContent && dropdownContent.contains(e.target)) {
                    const isAtTop = dropdownContent.scrollTop === 0;
                    const isAtBottom = dropdownContent.scrollHeight - dropdownContent.scrollTop === dropdownContent.clientHeight;
                    
                    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                        e.preventDefault();
                    }
                }
            };
            
            document.addEventListener('wheel', handleWheel, { passive: false });
            return () => document.removeEventListener('wheel', handleWheel);
        }
    }, [isOpen]);

    const handleMarkAllAsRead = async () => {
        await clearAll();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon & Badge */}
            <button 
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative p-2.5 rounded-xl transition-all duration-300 group
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isOpen 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }
                `}
                aria-label={`Notifications ${localUnreadCount > 0 ? `(${localUnreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell 
                    size={20} 
                    className={`transition-transform duration-300 ${isOpen ? 'animate-none' : 'group-hover:rotate-12'}`} 
                />
                {localUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-sm">
                        {localUnreadCount > 99 ? '99+' : localUnreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-300 transform origin-top-right">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                                    Notifications
                                </h4>
                                <p className="text-[10px] text-blue-100 font-medium mt-0.5">
                                    {localUnreadCount === 0 
                                        ? 'All caught up!' 
                                        : `You have ${localUnreadCount} unread ${localUnreadCount === 1 ? 'alert' : 'alerts'}`
                                    }
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {localUnreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllAsRead}
                                        className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg flex items-center gap-1.5 transition-all group"
                                        title="Mark all as read"
                                    >
                                        <Check size={14} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-bold uppercase hidden sm:inline">
                                            Mark all
                                        </span>
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all hover:scale-110"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mt-5 border-b border-white/10">
                            <button 
                                onClick={() => setActiveTab('all')}
                                className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                                    activeTab === 'all' ? 'text-white' : 'text-blue-200 hover:text-white'
                                }`}
                            >
                                All Notifications
                                {activeTab === 'all' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-in fade-in slide-in-from-bottom-1" />
                                )}
                            </button>
                            <button 
                                onClick={() => setActiveTab('service')}
                                className={`pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                                    activeTab === 'service' ? 'text-white' : 'text-blue-200 hover:text-white'
                                }`}
                            >
                                Service Alerts
                                {notifications.filter(n => n.category === 'service' && !n.is_read).length > 0 && (
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                )}
                                {activeTab === 'service' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-in fade-in slide-in-from-bottom-1" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="dropdown-content max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <>
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                                <NotificationSkeleton />
                            </>
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map(notification => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onMarkAsRead={markAsRead}
                                />
                            ))
                        ) : (
                            <div className="py-16 px-6 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={28} className="text-gray-300" />
                                </div>
                                <h6 className="font-bold text-gray-700 text-sm mb-1">
                                    {activeTab === 'service' ? 'No service alerts' : 'No notifications'}
                                </h6>
                                <p className="text-[11px] text-gray-400">
                                    {activeTab === 'service' 
                                        ? "Any upcoming service reminders will appear here." 
                                        : "You're all caught up! Check back later for updates."}
                                </p>
                            </div>
                        ) }
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Link 
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 text-center py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider hover:text-blue-600 transition-all bg-white rounded-lg hover:bg-blue-50"
                            >
                                View All
                            </Link>
                            <Link 
                                to="/settings/notifications"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider hover:text-blue-600 transition-all bg-white rounded-lg hover:bg-blue-50 flex items-center gap-1"
                            >
                                <Settings size={12} />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Global styles */}
            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }
                
                .animate-bounce {
                    animation: bounce 1.5s infinite;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-in {
                    animation-duration: 0.3s;
                    animation-fill-mode: both;
                }
                
                .zoom-in-95 {
                    animation-name: zoomIn;
                }
                
                .slide-in-from-top-2 {
                    animation-name: slideInFromTop;
                }
            `}</style>
        </div>
    );
}