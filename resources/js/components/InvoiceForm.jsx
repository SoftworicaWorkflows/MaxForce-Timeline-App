import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                        <select
                            required
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            value={formData.invoice_no}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            value={formData.issue_date}
                            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            value={formData.payment_method}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Invoice Items</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-gray-50 p-3 rounded-lg">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        required
                                        className="w-full rounded-lg border-gray-300 text-sm"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        required
                                        min="1"
                                        className="w-full rounded-lg border-gray-300 text-sm"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        required
                                        step="0.01"
                                        className="w-full rounded-lg border-gray-300 text-sm"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                    />
                                </div>
                                <div className="w-32 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm text-right font-semibold">
                                    ${item.amount}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500"
                            rows="4"
                            placeholder="Add any additional notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold">${formData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <div className="flex items-center gap-2">
                                <span>Include GST (10%)</span>
                                <button
                                    type="button"
                                    onClick={handleGstToggle}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.gst_status ? 'bg-red-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.gst_status ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <span className="font-semibold">${(formData.gst_status ? formData.subtotal * 0.1 : 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-gray-800 border-t pt-3">
                            <span>Total</span>
                            <span className="text-red-600">${formData.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-md disabled:opacity-50"
                >
                    <Save size={20} /> {loading ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;
