import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
    Users
} from 'lucide-react';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

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

    const SidebarItem = ({ to, icon: Icon, label, badge }) => (
        <NavLink
            to={to}
            onClick={() => isMobile && setIsSidebarOpen(false)}
            className={({ isActive }) => `
                group relative flex items-center gap-3 w-full px-4 py-3 md:px-5 md:py-3.5 
                transition-all duration-200 rounded-xl
                font-semibold text-sm tracking-wide
                ${isActive 
                    ? 'bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white shadow-lg shadow-[#1B365D]/20' 
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
                    {isActive && (
                        <ChevronRight size={16} className="text-[#8CC63F]" />
                    )}
                </>
            )}
        </NavLink>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 font-['Inter',system-ui,sans-serif]">
            {/* Mobile Header - Only visible on mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md">
                            <img src="/images/logo.png" alt="MaxForce" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-[#1B365D] text-sm tracking-tight">Max Force</span>
                            <span className="text-[9px] text-[#8CC63F] block -mt-0.5 font-bold">Pest Control</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl bg-gray-50 text-gray-600">
                            <Bell size={18} />
                        </button>
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-2 rounded-xl bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white shadow-md"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay - Mobile only */}
            {isSidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar - Fixed on desktop */}
            <aside className={`
                ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
                h-full w-72 bg-white shadow-2xl
                transform transition-transform duration-300 ease-in-out
                flex flex-col flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Logo Section - Desktop */}
                <div className="hidden md:block p-6 border-b border-gray-100 bg-gradient-to-r from-[#1B365D] to-[#1B365D]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1 bg-white rounded-xl shadow-lg transform transition-transform hover:scale-105 border border-gray-100">
                            <img src="/images/logo.png" alt="MaxForce Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white">Max Force</h1>
                            <p className="text-[10px] font-bold text-[#8CC63F] tracking-wider">PEST CONTROL</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-[10px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8CC63F]"></div>
                        <span>Emergency Response Ready 24/7</span>
                    </div>
                </div>

                {/* Mobile Logo Area */}
                <div className="md:hidden p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-1 bg-white rounded-xl border border-gray-100">
                            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <h2 className="font-black text-[#1B365D] text-lg">Max Force</h2>
                            <p className="text-[8px] text-[#8CC63F] font-black tracking-wider">PROFESSIONAL EXTERMINATORS</p>
                        </div>
                    </div>
                </div>
                
                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    {/* Main Section */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3 px-3">
                            Main Menu
                        </p>
                        <div className="space-y-1">
                            <SidebarItem to="/schedule" icon={CalendarIcon} label="Schedule Appointment" />
                        </div>
                    </div>

                    {/* Management Section */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3 px-3">
                            Management
                        </p>
                        <div className="space-y-1">
                            <SidebarItem to="/manage" icon={Clock} label="Manage Bookings" badge="12" />
                            <SidebarItem to="/customers" icon={Users} label="Manage Customers" />
                            <SidebarItem to="/create" icon={UserPlus} label="Register Customer" />
                            <SidebarItem to="/block" icon={Lock} label="Block Time Slots" />
                        </div>
                    </div>

                    {/* System Section */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3 px-3">
                            System
                        </p>
                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200">
                                <Settings size={20} className="text-gray-400" />
                                <span className="flex-1 text-left text-sm font-medium">Settings</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
                                <LogOut size={20} />
                                <span className="flex-1 text-left text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Today's Bookings</span>
                        <span className="text-sm font-black text-[#1B365D]">8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#8CC63F] h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[8px] text-gray-400 text-center mt-3">
                        © 2024 Max Force Pest Control
                    </p>
                </div>
            </aside>

            {/* Main Content Area - Scrolls independently */}
            <main className={`
                flex-1 h-full overflow-hidden flex flex-col
                transition-all duration-300
                ${isMobile ? 'pt-16' : ''}
            `}>
                <div className="h-full overflow-y-auto">
                    <div className="p-4 md:p-8 lg:p-10">
                                              
                        {/* Dynamic Content */}
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}