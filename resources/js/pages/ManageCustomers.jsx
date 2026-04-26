import React, { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../services/api';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Search,
    Plus,
    MoreVertical,
    ExternalLink,
    Edit3,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    Download,
    RefreshCw,
    DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EditCustomerModal from '../components/EditCustomerModal';
import ConfirmationModal from '../components/ConfirmationModal';


// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
        <div className={`rounded-xl p-4 shadow-lg flex items-center gap-3 ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
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

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
        </div>
    </div>
);

export default function ManageCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [contactConfirm, setContactConfirm] = useState({ isOpen: false, type: '', value: '', title: '', message: '' });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showToast('Failed to load customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCustomer(customerToDelete.id);
            await fetchCustomers();
            showToast(`Customer "${customerToDelete.name}" has been deleted`, 'success');
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        } catch (error) {
            console.error('Error deleting customer:', error);
            showToast(error.message || 'Failed to delete customer', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePhoneClick = (phone) => {
        setContactConfirm({
            isOpen: true,
            type: 'phone',
            value: phone,
            title: 'Call Customer?',
            message: `Do you want to call ${phone}?`
        });
    };

    const handleEmailClick = (email) => {
        setContactConfirm({
            isOpen: true,
            type: 'mail',
            value: email,
            title: 'Email Customer?',
            message: `Do you want to send an email to ${email}?`
        });
    };

    const handleAddressClick = (address) => {
        setContactConfirm({
            isOpen: true,
            type: 'address',
            value: address,
            title: 'Open in Maps?',
            message: `Do you want to see "${address}" on Google Maps?`
        });
    };

    const handleContactConfirm = () => {
        if (contactConfirm.type === 'phone') {
            window.location.href = `tel:${contactConfirm.value}`;
        } else if (contactConfirm.type === 'mail') {
            window.location.href = `mailto:${contactConfirm.value}`;
        } else if (contactConfirm.type === 'address') {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfirm.value)}`, '_blank');
        }
        setContactConfirm({ ...contactConfirm, isOpen: false });
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status !== 'inactive').length,
        newThisMonth: customers.filter(c => {
            const createdDate = new Date(c.created_at);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() &&
                createdDate.getFullYear() === now.getFullYear();
        }).length
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Phone', 'Email', 'Address', 'Status', 'Price'];
        const csvData = filteredCustomers.map(c => [
            c.id,
            c.name,
            c.phone,
            c.email || '',
            c.address || '',
            c.status || 'active',
            c.price || ''
        ]);

        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Export completed successfully', 'success');
    };

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

            {/* Delete Confirmation Dialog */}
            <ConfirmationModal
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setCustomerToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Customer"
                message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete Customer"
                type="warning"
                isLoading={isDeleting}
            />

            {/* Contact Confirmation Dialog */}
            <ConfirmationModal
                isOpen={contactConfirm.isOpen}
                onClose={() => setContactConfirm({ ...contactConfirm, isOpen: false })}
                onConfirm={handleContactConfirm}
                title={contactConfirm.title}
                message={contactConfirm.message}
                confirmText={
                    contactConfirm.type === 'phone' ? 'Call Now' : 
                    contactConfirm.type === 'mail' ? 'Send Email' : 'Open Maps'
                }
                type={contactConfirm.type}
            />

            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Customer Database</h2>
                    <p className="text-xs text-gray-500 font-medium tracking-wider mt-1">
                        Manage and monitor all registered clients
                    </p>
                </div>
                <Link
                    to="/create"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1B365D] to-[#1B365D] text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-xs uppercase"
                >
                    <Plus size={16} />
                    Add New Customer
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Customers" value={stats.total} icon={User} color="bg-blue-500" />
                <StatCard title="Active Clients" value={stats.active} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="New This Month" value={stats.newThisMonth} icon={Plus} color="bg-purple-500" />
            </div>

            {/* Toolbar Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B365D] focus:bg-white transition-all font-medium text-sm"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all text-sm border border-gray-200"
                            title="Export to CSV"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button
                            onClick={fetchCustomers}
                            className="p-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto relative scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                // Loading skeletons
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                                                <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="h-5 bg-gray-200 rounded-full w-16 mx-auto"></div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                        {/* Customer Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#1B365D] to-[#1B365D] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight mb-0.5 capitalize">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                        ID: #{typeof customer.id === 'string' ? customer.id.slice(0, 8) : customer.id || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact Info */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <button 
                                                    onClick={() => handlePhoneClick(customer.phone)}
                                                    className="flex items-center justify-center gap-1.5 w-full hover:bg-blue-50 py-1 rounded-lg transition-colors group/phone"
                                                >
                                                    <Phone size={11} className="text-[#8CC63F] group-hover/phone:text-blue-600" />
                                                    <span className="text-xs font-semibold text-gray-700 group-hover/phone:text-blue-700">{customer.phone}</span>
                                                </button>
                                                {customer.email && (
                                                    <button 
                                                        onClick={() => handleEmailClick(customer.email)}
                                                        className="flex items-center justify-center gap-1.5 w-full hover:bg-green-50 py-1 rounded-lg transition-colors group/mail"
                                                    >
                                                        <Mail size={11} className="text-gray-400 group-hover/mail:text-[#8CC63F]" />
                                                        <span className="text-[10px] font-medium text-gray-500 truncate max-w-[150px] group-hover/mail:text-green-700">
                                                            {customer.email}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Address */}
                                        <td className="px-6 py-4 max-w-[250px]">
                                            {customer.address && (
                                                <button 
                                                    onClick={() => handleAddressClick(customer.address)}
                                                    className="flex items-center justify-start gap-1.5 w-full hover:bg-orange-50 py-1 px-2 rounded-lg transition-colors group/addr"
                                                >
                                                    <MapPin size={11} className="text-gray-400 group-hover/addr:text-orange-500 flex-shrink-0" />
                                                    <span className="text-[10px] text-gray-500 font-medium truncate group-hover/addr:text-orange-700">
                                                        {customer.address}
                                                    </span>
                                                </button>
                                            )}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 text-center">
                                            {customer.price !== null && customer.price !== undefined ? (
                                                <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                                                    <DollarSign size={14} className="text-[#8CC63F]" />
                                                    {parseFloat(customer.price).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium italic">N/A</span>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                Active
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="p-2 bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-200"
                                                    title="Edit Customer"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(customer)}
                                                    className="p-2 bg-gray-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Empty State
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Search size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No customers found</h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                {searchTerm ? 'No results match your search criteria' : 'Start by adding your first customer'}
                                            </p>
                                            {searchTerm ? (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-[#8CC63F] text-sm font-semibold hover:underline"
                                                >
                                                    Clear search
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/create"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B365D] text-white rounded-lg hover:shadow-md transition-all text-sm font-semibold"
                                                >
                                                    <Plus size={16} />
                                                    Add Customer
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Customer Modal */}
            <EditCustomerModal
                isOpen={isEditModalOpen}
                customer={selectedCustomer}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCustomer(null);
                }}
                onUpdateSuccess={() => {
                    fetchCustomers();
                    showToast('Customer updated successfully', 'success');
                }}
            />
        </div>
    );
}