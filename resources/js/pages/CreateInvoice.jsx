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
        <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/invoices')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>
                    <p className="text-gray-500">Fill in the details to generate a professional invoice</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <InvoiceForm onSaveSuccess={handleSaveSuccess} />
            </div>
        </div>
    );
};

export default CreateInvoice;
