import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { getBookings } from '../services/api';
import {
    Calendar as CalendarIcon,
    Clock,
    UserPlus,
    Lock,
    Menu,
    X,
    Shield,
    ChevronRight,
    LogOut,
    Bell,
    Settings,
    Users,
    Search,
    LayoutDashboard,
    ChevronDown,
    User,
    HelpCircle,
    FileText
} from 'lucide-react';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import LogoutModal from '../components/LogoutModal';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [lastLogin, setLastLogin] = useState('');
    const location = useLocation();

    useEffect(() => {
        const loginTime = localStorage.getItem('lastLoginTime');
        if (loginTime) setLastLogin(loginTime);
    }, []);

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const res = await getBookings();
                if (res.success && res.bookings) {
                    const count = res.bookings.filter(b => b.status === 'booked').length;
                    setUpcomingCount(count);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchNavData();
    }, [location]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [location, isMobile]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserMenuOpen && !event.target.closest('.user-menu')) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isUserMenuOpen]);

    return (
        <NotificationProvider>
            <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <SidebarAndMain
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMobile={isMobile}
                    setIsLogoutModalOpen={setIsLogoutModalOpen}
                    currentTime={currentTime}
                    isUserMenuOpen={isUserMenuOpen}
                    setIsUserMenuOpen={setIsUserMenuOpen}
                    upcomingCount={upcomingCount}
                    lastLogin={lastLogin}
                />

                <LogoutModal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    userName="Admin User"
                    lastLogin={lastLogin}
                    onConfirm={() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('lastLoginTime');
                        localStorage.removeItem('userEmail');
                        window.location.href = '/';
                    }}
                />
            </div>
        </NotificationProvider>
    );
}

const SidebarAndMain = ({ 
    isSidebarOpen, 
    setIsSidebarOpen, 
    isMobile, 
    setIsLogoutModalOpen, 
    currentTime,
    isUserMenuOpen,
    setIsUserMenuOpen,
    upcomingCount,
    lastLogin
}) => {
    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-white">
                            <img src="/images/logo.png" alt="MaxForce" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900">MaxForce</h1>
                            <p className="text-[9px] font-medium text-gray-500">Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-xl bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white shadow-md hover:shadow-lg transition-all"
                            aria-label="Toggle menu"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside className={`
                ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
                h-full w-72 bg-white shadow-2xl transition-all duration-300 ease-in-out
                flex flex-col flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                {/* Desktop Logo Section */}
                <div className="hidden md:block p-6 border-b border-gray-100 bg-gradient-to-r from-[#1B365D] to-[#1B365D]">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <img src="/images/logo.png" alt="MaxForce Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-bold tracking-tight">MaxForce</h2>
                            <p className="text-[9px] font-medium text-white/70 uppercase tracking-wider">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <NavSection title="Main Overview">
                        <SidebarItem to="/schedule" icon={CalendarIcon} label="My Schedule" />
                    </NavSection>

                    <NavSection title="Customer Management">
                        <SidebarItem to="/customers" icon={Users} label="Manage Customers" />
                        <SidebarItem 
                            to="/manage" 
                            icon={Clock} 
                            label="Customer Schedule" 
                            badge={upcomingCount > 0 ? upcomingCount.toString() : null} 
                        />
                        <SidebarItem to="/invoices" icon={FileText} label="Invoices" />
                    </NavSection>

                    <NavSection title="System & Security">
                        <SidebarItem to="/reports" icon={LayoutDashboard} label="Reports" />
                        <SidebarItem to="/settings" icon={Settings} label="Settings" />
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium group"
                        >
                            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="flex-1 text-left text-sm">Logout</span>
                        </button>
                    </NavSection>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="flex-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">System Status</p>
                                <p className="text-xs font-semibold text-gray-700">Operational</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 h-full overflow-hidden flex flex-col ${isMobile ? 'pt-16' : ''}`}>
                {/* Desktop Top Header */}
                <header className="hidden md:flex h-20 bg-white border-b border-gray-100 px-6 lg:px-8 items-center justify-between sticky top-0 z-30 shadow-sm">
                    {/* Search Bar */}
                    <div className="flex-1" /> {/* Spacer */}
                    
                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Live Clock */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Live System</p>
                                <p className="text-sm font-bold text-gray-900 tabular-nums">
                                    {currentTime.toLocaleTimeString('en-US', { 
                                        hour12: true, 
                                        hour: '2-digit', 
                                        minute: '2-digit', 
                                        second: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Last Login Badge */}
                        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <Clock size={16} className="text-blue-500" />
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Last Login</p>
                                <p className="text-[11px] font-bold text-gray-700">
                                    {lastLogin || 'Just now'}
                                </p>
                            </div>
                        </div>

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Menu */}
                        <div className="relative user-menu">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold text-gray-900 leading-none">Admin User</p>
                                    <p className="text-[10px] font-semibold text-green-600 uppercase tracking-tighter mt-1">
                                        System Manager
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B365D] to-[#1B365D] flex items-center justify-center text-white shadow-md">
                                    <User size={20} />
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900">Admin User</p>
                                        <p className="text-xs text-gray-500">admin@maxforce.com</p>
                                    </div>
                                    <div className="pt-1">
                                        <button 
                                            onClick={() => setIsLogoutModalOpen(true)}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-semibold"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50/30">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </>
    );
};

const NavSection = ({ title, children }) => (
    <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3">
            {title}
        </p>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            group relative flex items-center gap-3 w-full px-4 py-3 
            transition-all duration-200 rounded-xl font-semibold text-sm
            ${isActive
                ? 'bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#1B365D]'
            }
        `}
    >
        {({ isActive }) => (
            <>
                <Icon
                    size={20}
                    className={`transition-all duration-200 ${isActive ? 'text-[#8CC63F]' : 'text-gray-400 group-hover:text-[#8CC63F]'}`}
                />
                <span className="flex-1 text-left">{label}</span>
                {badge && !isActive && (
                    <span className="text-[9px] font-black bg-[#8CC63F] text-[#1B365D] px-1.5 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
                {isActive && <ChevronRight size={16} className="text-[#8CC63F] animate-in slide-in-from-left-1" />}
            </>
        )}
    </NavLink>
);