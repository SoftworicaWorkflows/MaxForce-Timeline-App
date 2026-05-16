import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import InvoiceForm from '../components/InvoiceForm';

const CreateInvoice = () => {
    const navigate = useNavigate();

    const handleSaveSuccess = (invoice) => {
        navigate(`/invoices/view/${invoice.id}`);
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/invoices')}
                    className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-500 border border-transparent hover:border-gray-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-primary tracking-tight">Create New Invoice</h1>
                    <p className="text-gray-500 font-medium">Generate a professional invoice for your client</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto pb-12">
                <InvoiceForm onSaveSuccess={handleSaveSuccess} />
            </div>
        </div>
    );
};

export default CreateInvoice;
