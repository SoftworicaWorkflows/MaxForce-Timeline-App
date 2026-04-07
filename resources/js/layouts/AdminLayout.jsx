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
    Users,
    Search,
    LayoutDashboard
} from 'lucide-react';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import LogoutModal from '../components/LogoutModal';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

    return (
        <NotificationProvider>
            <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 font-['Inter',system-ui,sans-serif]">
                <SidebarAndMain 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                    isMobile={isMobile} 
                    setIsLogoutModalOpen={setIsLogoutModalOpen}
                />
                
                <LogoutModal 
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirm={() => {
                        localStorage.removeItem('isLoggedIn');
                        window.location.href = '/';
                    }}
                />
            </div>
        </NotificationProvider>
    );
}

const SidebarAndMain = ({ isSidebarOpen, setIsSidebarOpen, isMobile, setIsLogoutModalOpen }) => {
    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md">
                            <img src="/images/logo.png" alt="MaxForce" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-2 rounded-xl bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white shadow-md"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside className={`
                ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
                h-full w-72 bg-white shadow-2xl transition-transform duration-300
                flex flex-col flex-shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                <div className="hidden md:block p-6 border-b border-gray-100 bg-[#1B365D]">
                    <div className="p-1 bg-white rounded-sm transform transition-all border border-gray-100">
                        <img src="/images/logo.png" alt="MaxForce Logo" className="w-full h-12 object-contain" />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin">
                    <NavSection title="Main Overview">
                        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem to="/schedule" icon={CalendarIcon} label="My Schedule" />
                    </NavSection>

                    <NavSection title="Customer Section">
                        <SidebarItem to="/create" icon={UserPlus} label="Add Customer" />
                        <SidebarItem to="/customers" icon={Users} label="Manage Customers" />
                        <SidebarItem to="/manage" icon={Clock} label="Customer Schedule" badge="12" />
                    </NavSection>

                    <NavSection title="System">
                        <SidebarItem to="/settings" icon={Settings} label="Settings" />
                        <button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
                        >
                            <LogOut size={20} />
                            <span className="flex-1 text-left text-sm">Logout</span>
                        </button>
                    </NavSection>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 h-full overflow-hidden flex flex-col ${isMobile ? 'pt-16' : ''}`}>
                {/* Desktop Top Header */}
                <header className="hidden md:flex h-20 bg-white border-b border-gray-100 px-8 items-center justify-between sticky top-0 z-30">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B365D] transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Quick search bookings..." 
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all text-xs font-semibold"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <NotificationDropdown />
                        <div className="h-10 w-[1px] bg-gray-100 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-black text-[#1B365D] leading-none mb-1">Admin User</p>
                                <p className="text-[10px] font-bold text-[#8CC63F] uppercase tracking-tighter">System Manager</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1B365D] to-[#2b518a] rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin bg-gray-50/30">
                    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </>
    );
};

const NavSection = ({ title, children }) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3 px-3">
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
                    className={`transition-all ${isActive ? 'text-[#8CC63F]' : 'text-gray-400 group-hover:text-[#8CC63F]'}`} 
                />
                <span className="flex-1 text-left">{label}</span>
                {badge && !isActive && (
                    <span className="text-[9px] font-black bg-[#8CC63F] text-[#1B365D] px-1.5 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
                {isActive && <ChevronRight size={16} className="text-[#8CC63F]" />}
            </>
        )}
    </NavLink>
);