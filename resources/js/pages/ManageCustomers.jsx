import React, { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../services/api';
import { User, Phone, Mail, MapPin, Search, Plus, Filter, MoreVertical, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditCustomerModal from '../components/EditCustomerModal';

export default function ManageCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleDeleteCustomer = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? This will NOT delete their service history, but the records will no longer be linked to this profile.')) {
            try {
                await deleteCustomer(id);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert(error.message || 'Failed to delete customer.');
            }
        }
    };

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header section */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#1B365D]">Customer Database</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {customers.length} Registered Clients
                    </p>
                </div>
                <Link 
                    to="/create"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#8CC63F] text-[#1B365D] font-black rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-xs uppercase"
                >
                    <Plus size={16} />
                    Add New Customer
                </Link>
            </div>

            {/* Toolbar section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, phone or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#8CC63F] focus:bg-white transition-all font-semibold text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs">
                        <Filter size={16} />
                        Filters
                    </button>
                    <button 
                        onClick={fetchCustomers}
                        className="p-3 bg-gray-50 text-[#1B365D] rounded-xl hover:bg-gray-100 transition-all"
                    >
                        <ExternalLink size={18} />
                    </button>
                </div>
            </div>

            {/* Customers Table wrapper */}
            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="overflow-x-auto relative scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Contact Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Service Address</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48 mx-auto"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#1B365D] rounded-xl flex items-center justify-center text-[#8CC63F] font-black shadow-inner">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1B365D] text-sm leading-none mb-1 capitalize">{customer.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Client #{customer.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 items-center">
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 group-hover:bg-white transition-all">
                                                    <Phone size={10} className="text-[#8CC63F]" />
                                                    <span className="text-xs font-bold text-gray-600 tracking-tighter leading-none">{customer.phone}</span>
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 px-3">
                                                        <Mail size={10} className="text-gray-300" />
                                                        <span className="text-[10px] font-medium text-gray-400">{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[300px]">
                                            <div className="flex items-start gap-2 justify-center">
                                                <MapPin size={14} className="text-[#8CC63F] flex-shrink-0 mt-0.5" />
                                                <span className="text-xs font-semibold text-gray-500 line-clamp-2 text-center leading-relaxed">
                                                    {customer.address || 'No Address Provided'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 isolate">
                                                <button 
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="p-2.5 bg-gray-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all"
                                                    title="Edit Profile"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="p-2.5 bg-gray-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                <Search size={32} className="text-gray-200" />
                                            </div>
                                            <p className="font-bold text-gray-400">No customers found matching your search</p>
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="text-[#8CC63F] text-xs font-black uppercase mt-2 hover:underline"
                                            >
                                                Clear Search
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <EditCustomerModal 
                isOpen={isEditModalOpen} 
                customer={selectedCustomer} 
                onClose={() => setIsEditModalOpen(false)} 
                onUpdateSuccess={fetchCustomers} 
            />
        </div>
    );
}
