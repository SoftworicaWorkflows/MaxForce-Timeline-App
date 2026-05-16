import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, User, Hash, Calendar, CreditCard, FileText, ChevronDown, DollarSign } from 'lucide-react';
import { getCustomers, getNextInvoiceNumber, createInvoice } from '../services/api';

const InvoiceForm = ({ onSaveSuccess }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        invoice_no: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        payment_method: 'Bank Transfer',
        gst_status: false,
        notes: '',
        items: [
            { description: '', qty: 1, unit_price: 0, amount: 0 }
        ],
        subtotal: 0,
        total: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [custRes, invNoRes] = await Promise.all([
                getCustomers(),
                getNextInvoiceNumber()
            ]);
            setCustomers(custRes.customers || []);
            setFormData(prev => ({
                ...prev,
                invoice_no: invNoRes.invoice_no
            }));
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const calculateTotals = (items, gstStatus) => {
        const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        const gst = gstStatus ? subtotal * 0.1 : 0;
        const total = subtotal + gst;
        return { subtotal, total };
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'qty' || field === 'unit_price') {
            const qty = parseFloat(newItems[index].qty) || 0;
            const price = parseFloat(newItems[index].unit_price) || 0;
            newItems[index].amount = (qty * price).toFixed(2);
        }

        const { subtotal, total } = calculateTotals(newItems, formData.gst_status);
        setFormData({ ...formData, items: newItems, subtotal, total });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', qty: 1, unit_price: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        const { subtotal, total } = calculateTotals(newItems, formData.gst_status);
        setFormData({ ...formData, items: newItems, subtotal, total });
    };

    const handleGstToggle = () => {
        const newGstStatus = !formData.gst_status;
        const { subtotal, total } = calculateTotals(formData.items, newGstStatus);
        setFormData({ ...formData, gst_status: newGstStatus, subtotal, total });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createInvoice(formData);
            if (res.success) {
                onSaveSuccess(res.invoice);
            }
        } catch (error) {
            alert(error.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Header Card: General Information */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="bg-primary px-6 py-4 flex items-center gap-3">
                    <FileText className="text-secondary" size={20} />
                    <h2 className="text-white font-bold tracking-wide uppercase text-sm">Invoice Details</h2>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <User size={16} className="text-primary" /> Customer
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 focus:ring-secondary focus:border-secondary transition-all appearance-none cursor-pointer"
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Hash size={16} className="text-primary" /> Invoice Number
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border-gray-200 bg-gray-100/50 py-3 px-4 text-gray-500 font-mono font-bold"
                                value={formData.invoice_no}
                                readOnly
                            />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Will be automatically generated</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar size={16} className="text-primary" /> Issue Date
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 focus:ring-secondary focus:border-secondary transition-all"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar size={16} className="text-primary" /> Due Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 px-4 focus:ring-secondary focus:border-secondary transition-all"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <CreditCard size={16} className="text-primary" /> Payment Method
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 focus:ring-secondary focus:border-secondary transition-all appearance-none cursor-pointer"
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Plus size={20} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Invoice Items</h3>
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                        <Plus size={18} /> Add New Item
                    </button>
                </div>
                
                <div className="p-8">
                    <div className="hidden md:grid grid-cols-[1fr_120px_160px_160px_50px] gap-4 mb-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                        <div>Description</div>
                        <div className="text-center">Qty</div>
                        <div className="text-right">Unit Price ($)</div>
                        <div className="text-right">Total ($)</div>
                        <div></div>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="group flex flex-wrap md:flex-nowrap gap-4 items-start bg-gray-50/50 hover:bg-white hover:shadow-lg hover:shadow-gray-100 p-4 rounded-2xl border border-transparent hover:border-gray-100 transition-all duration-300">
                                <div className="flex-1 min-w-[250px]">
                                    <input
                                        type="text"
                                        placeholder="Pest control services..."
                                        required
                                        className="w-full rounded-xl border-gray-200 bg-white py-3 px-4 focus:ring-secondary focus:border-secondary transition-all"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-[120px]">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        required
                                        min="1"
                                        className="w-full rounded-xl border-gray-200 bg-white py-3 px-4 text-center focus:ring-secondary focus:border-secondary transition-all"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-[160px] relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        step="0.01"
                                        className="w-full rounded-xl border-gray-200 bg-white py-3 pl-10 pr-4 text-right focus:ring-secondary focus:border-secondary transition-all font-semibold"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-[160px] py-3 px-4 bg-primary/5 border border-primary/10 rounded-xl text-right font-bold text-primary">
                                    ${parseFloat(item.amount).toFixed(2)}
                                </div>
                                <div className="flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className={`p-3 rounded-xl transition-all ${formData.items.length === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-red-500 shadow-sm hover:shadow-red-200'}`}
                                        disabled={formData.items.length === 1}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: Notes and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <FileText size={16} className="text-primary" /> Additional Notes
                    </label>
                    <textarea
                        className="w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 focus:ring-secondary focus:border-secondary transition-all min-h-[160px]"
                        placeholder="Add special instructions, bank details, or terms..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-xl font-bold text-primary">${formData.subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-gray-100/50">
                            <div className="space-y-1">
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Tax Configuration</span>
                                <span className="font-bold text-primary">Include GST (10%)</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleGstToggle}
                                className={`w-14 h-7 rounded-full transition-all relative border-2 ${formData.gst_status ? 'bg-secondary border-secondary' : 'bg-gray-200 border-gray-200'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${formData.gst_status ? 'left-7' : 'left-0.5'}`}></div>
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                            <span>GST Amount</span>
                            <span className="text-xl font-bold text-primary">${(formData.gst_status ? formData.subtotal * 0.1 : 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Total Amount Due</span>
                                <div className="text-5xl font-black tracking-tighter text-primary">${formData.total.toFixed(2)}</div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={28} className="text-secondary" /> <span>Save Invoice</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default InvoiceForm;
