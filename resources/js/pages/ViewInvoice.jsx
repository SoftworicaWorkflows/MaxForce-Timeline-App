import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import { getInvoice } from '../services/api';
import InvoicePreview from '../components/InvoicePreview';

const ViewInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const res = await getInvoice(id);
            if (res.success) {
                setInvoice(res.invoice);
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!invoice) return (
        <div className="p-12 text-center text-gray-500">
            Invoice not found
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/invoices')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoice_no}</h1>
                        <p className="text-gray-500">Preview and print the invoice for {invoice.customer?.name}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-[#8CC63F] text-[#1B365D]  px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10"
                    >
                        <Printer size={20} className="text-secondary" /> Print Invoice
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
                <InvoicePreview invoice={invoice} />
            </div>
        </div>
    );
};

export default ViewInvoice;
