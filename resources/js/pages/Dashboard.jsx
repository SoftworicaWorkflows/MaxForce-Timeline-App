import React, { useState, useEffect } from 'react';
import { getDashboardStats, getBookings } from '../services/api';
import { 
    Users, 
    Zap, 
    TrendingUp, 
    Bell,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Briefcase,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, delay, trend, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500 fill-mode-both`} 
             style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider mb-2">{title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                            {value}
                        </h3>
                        {trend && (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                                trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                                {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shrink-0 ml-3`}>
                    <Icon size={22} />
                </div>
            </div>
        </div>
    );
};

// Booking Item Component
const BookingItem = ({ booking, index }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group animate-in slide-in-from-right-4 duration-500 fill-mode-both" 
         style={{ animationDelay: `${index * 100}ms` }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100 shrink-0">
                <span className="text-[9px] font-bold text-green-600 uppercase leading-none">
                    {new Date(booking.booking_date).toLocaleDateString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-bold text-gray-900 leading-tight">
                    {new Date(booking.booking_date).toLocaleDateString('default', { day: 'numeric' })}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-green-600 transition-colors">
                    {booking.customer_name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> 
                        {booking.start_time?.substring(0, 5) || '--:--'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Briefcase size={12} /> 
                        Pest Control
                    </span>
                </div>
            </div>
        </div>
        <div className="ml-3 hidden sm:block">
            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                Confirmed
            </span>
        </div>
        <ChevronRight size={16} className="text-gray-400 ml-2 sm:hidden" />
    </div>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard isLoading={true} />
            <StatCard isLoading={true} />
            <StatCard isLoading={true} />
            <StatCard isLoading={true} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
                <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalBookings: 0,
        bookingsThisMonth: 0,
        upcomingBookings: 0,
        unreadNotifications: 0,
        bookingTrends: [],
        customerTrends: []
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                getDashboardStats(),
                getBookings()
            ]);
            
            if (statsRes.success) setStats(statsRes.stats);
            if (bookingsRes.success) {
                const upcoming = (bookingsRes.bookings || [])
                    .filter(b => b.status === 'booked')
                    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
                    .slice(0, 5);
                setRecentBookings(upcoming);
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 p-3 rounded-xl shadow-2xl border border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                            Executive Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                            Analytics & Operations Summary
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Live Updates
                            </span>
                        </div>
                        
                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 text-sm font-medium text-gray-700"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        
                        {lastUpdated && (
                            <span className="text-[10px] text-gray-400">
                                Updated {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <StatCard 
                        title="Total Customers" 
                        value={stats.totalCustomers?.toLocaleString() || 0} 
                        icon={Users} 
                        color="bg-gradient-to-br from-blue-500 to-blue-600" 
                        delay={100}
                    />
                    <StatCard 
                        title="Bookings This Month" 
                        value={stats.bookingsThisMonth || 0} 
                        icon={Zap} 
                        color="bg-gradient-to-br from-green-500 to-green-600" 
                        delay={200}
                    />
                    <StatCard 
                        title="Upcoming Bookings" 
                        value={stats.upcomingBookings || 0} 
                        icon={TrendingUp} 
                        color="bg-gradient-to-br from-indigo-500 to-indigo-600" 
                        delay={300}
                    />
                    <StatCard 
                        title="System Alerts" 
                        value={stats.unreadNotifications || 0} 
                        icon={Bell} 
                        color="bg-gradient-to-br from-rose-500 to-rose-600" 
                        delay={400}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Service Volume Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 transition-all hover:shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Service Volume</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Monthly Booking Trends</p>
                            </div>
                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider self-start sm:self-auto">
                                Last 6 Months
                            </div>
                        </div>
                        <div className="h-72 sm:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.bookingTrends || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 11, fontWeight: 600, fill: '#94A3B8'}}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#F8FAFC'}} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                        {(stats.bookingTrends || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 5 ? '#10B981' : '#3B82F6'} opacity={0.7 + (index * 0.05)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Growth Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6 transition-all hover:shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Customer Acquisition</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">New Customer Growth</p>
                            </div>
                            <div className="px-3 py-1.5 bg-green-50 rounded-lg text-[10px] font-bold text-green-600 uppercase tracking-wider self-start sm:self-auto">
                                +{stats.customerTrends?.[stats.customerTrends.length - 1]?.count || 0} this month
                            </div>
                        </div>
                        <div className="h-72 sm:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.customerTrends || []}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 11, fontWeight: 600, fill: '#94A3B8'}}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#10B981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorCount)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-xl text-gray-700">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Upcoming Schedule</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Next {recentBookings.length} confirmed appointments</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, index) => (
                                <BookingItem key={booking.id} booking={booking} index={index} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No upcoming appointments</p>
                                <p className="text-xs text-gray-400 mt-1">New bookings will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}