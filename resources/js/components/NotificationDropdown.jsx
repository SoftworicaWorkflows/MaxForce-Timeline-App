import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, Clock, Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// Simple time ago formatter to avoid date-fns dependency issues
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

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'error': return <AlertCircle className="text-red-500" size={16} />;
            case 'info':
            default: return <Info className="text-[#1B365D]" size={16} />;
        }
    };

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`
                p-4 transition-all duration-200 cursor-pointer 
                border-b border-gray-50 flex gap-4
                ${notification.is_read ? 'opacity-60 bg-white' : 'bg-[#1B365D]/5 hover:bg-[#1B365D]/10'}
            `}
        >
            <div className={`p-2 rounded-xl flex-shrink-0 ${notification.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h5 className={`text-xs font-black truncate ${notification.is_read ? 'text-gray-500' : 'text-[#1B365D]'}`}>
                        {notification.title}
                    </h5>
                    {!notification.is_read && (
                        <div className="w-2 h-2 bg-[#8CC63F] rounded-full animate-pulse flex-shrink-0 ml-2" />
                    )}
                </div>
                <p className={`text-[10px] line-clamp-2 leading-relaxed mb-1 ${notification.is_read ? 'text-gray-400 font-medium' : 'text-gray-600 font-bold'}`}>
                    {notification.message}
                </p>
                <div className="flex items-center gap-1.5 text-[8px] text-gray-400 font-black uppercase tracking-widest">
                    <Clock size={10} />
                    {formatTimeAgo(notification.created_at)}
                </div>
            </div>
        </div>
    );
};

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, clearAll, loading } = useNotifications();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon & Badge */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2.5 rounded-xl transition-all duration-300 relative group
                    ${isOpen ? 'bg-[#1B365D] text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                `}
            >
                <Bell size={20} className={isOpen ? 'animate-none' : 'group-hover:rotate-12 transition-transform'} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white animate-bounce-short shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 transform origin-top-right">
                    {/* Header */}
                    <div className="bg-[#1B365D] p-5 flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-wider">Notifications</h4>
                            <p className="text-[10px] text-[#8CC63F] font-bold mt-0.5">
                                You have {unreadCount} unread alerts
                            </p>
                        </div>
                        <div className="flex gap-2">
                             {unreadCount > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                                    className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg flex items-center gap-1.5 transition-all group"
                                    title="Mark all as read"
                                >
                                    <Check size={14} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase">Clear All</span>
                                </button>
                             )}
                             <button onClick={() => setIsOpen(false)} className="p-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg">
                                <X size={14} />
                             </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="w-8 h-8 border-2 border-[#1B365D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-[10px] font-black uppercase text-gray-400">Loading alerts...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map(notification => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onMarkAsRead={markAsRead} 
                                />
                            ))
                        ) : (
                            <div className="py-12 px-6 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={24} className="text-gray-200" />
                                </div>
                                <h6 className="font-black text-[#1B365D] text-xs uppercase mb-1">All Caught Up!</h6>
                                <p className="text-[10px] text-gray-400 font-medium">No new notifications to show.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <Link 
                            to="/activity"
                            onClick={() => setIsOpen(false)}
                            className="block w-full py-2 text-[10px] font-black text-[#1B365D] uppercase tracking-widest hover:text-[#8CC63F] transition-all"
                        >
                            View All Activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add these styles to your global CSS
// .animate-bounce-short { animation: bounce-short 1.5s infinite; }
// @keyframes bounce-short {
//   0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
//   50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
// }
