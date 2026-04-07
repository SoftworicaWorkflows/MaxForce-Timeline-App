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
    Briefcase
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

const StatCard = ({ title, value, icon: Icon, color, delay, trend }) => (
    <div className={`bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500 fill-mode-both`} style={{ animationDelay: `${delay}ms` }}>
        <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{title}</p>
            <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-[#1B365D] tracking-tight">{value}</h3>
                {trend && (
                    <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-lg ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
            <Icon size={24} />
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                getDashboardStats(),
                getBookings()
            ]);
            
            if (statsRes.success) setStats(statsRes.stats);
            if (bookingsRes.success) {
                // Get the next 5 upcoming bookings
                const upcoming = (bookingsRes.bookings || [])
                    .filter(b => b.status === 'booked')
                    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
                    .slice(0, 5);
                setRecentBookings(upcoming);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1B365D] p-3 rounded-xl border border-white/10 shadow-2xl">
                    <p className="text-[10px] font-black text-[#8CC63F] uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-black text-white">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full pb-10 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-[#1B365D] tracking-tight">Executive Dashboard</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Analytics & Operations Summary</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Updates Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Customers" 
                    value={stats.totalCustomers} 
                    icon={Users} 
                    color="bg-blue-600" 
                    delay={100}
                    trend={12}
                />
                <StatCard 
                    title="Bookings Month" 
                    value={stats.bookingsThisMonth} 
                    icon={Zap} 
                    color="bg-[#8CC63F]" 
                    delay={200}
                    trend={8}
                />
                <StatCard 
                    title="Expected Volume" 
                    value={stats.upcomingBookings} 
                    icon={TrendingUp} 
                    color="bg-indigo-600" 
                    delay={300}
                />
                <StatCard 
                    title="System Alerts" 
                    value={stats.unreadNotifications} 
                    icon={Bell} 
                    color="bg-rose-500" 
                    delay={400}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Volume Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-[#1B365D] tracking-tight">Service Volume</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Monthly Booking Trends</p>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase">Last 6 Months</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.bookingTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#CBD5E1'}}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#F8FAFC'}} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                    {stats.bookingTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 5 ? '#8CC63F' : '#1B365D'} opacity={0.8 + (index * 0.04)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Growth Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-[#1B365D] tracking-tight">Acquisition</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">New Customer Growth</p>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase">Success Rate</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.customerTrends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8CC63F" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8CC63F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#CBD5E1'}}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#8CC63F" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Bookings List */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-xl text-[#1B365D]">
                                <Calendar size={20} />
                            </div>
                            <h3 className="text-lg font-black text-[#1B365D]">Upcoming Schedule</h3>
                        </div>
                        <a href="/schedule" className="text-[10px] font-black text-[#8CC63F] uppercase tracking-widest hover:underline">View All Schedule</a>
                    </div>
                    
                    <div className="space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking, index) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#8CC63F] transition-all group animate-in slide-in-from-right-4 duration-500 fill-mode-both" style={{animationDelay: `${index * 100}ms`}}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                                            <span className="text-[8px] font-black text-[#8CC63F] uppercase leading-none">{new Date(booking.booking_date).toLocaleDateString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-black text-[#1B365D] leading-tight">{new Date(booking.booking_date).toLocaleDateString('default', { day: 'numeric' })}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1B365D] text-sm group-hover:text-[#8CC63F] transition-colors">{booking.customer_name}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                <span className="flex items-center gap-1"><Clock size={10} /> {booking.start_time?.substring(0, 5)}</span>
                                                <span className="flex items-center gap-1"><Briefcase size={10} /> Pest Control</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-[#1B365D] uppercase tracking-widest">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-200" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No upcoming services</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Theme Highlight */}
                <div className="bg-[#1B365D] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <Zap size={140} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                        <h3 className="text-xl font-black mb-2 leading-tight">System Performance</h3>
                        <p className="text-xs text-white/60 font-bold mb-8">Data based on last 30 days of service operations.</p>
                        
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>Efficiency</span>
                                    <span className="text-[#8CC63F]">94%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#8CC63F] rounded-full" style={{width: '94%'}}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span>Retention</span>
                                    <span className="text-blue-400">82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full" style={{width: '82%'}}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8CC63F]">Premium Analytics Powered</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
