import React from 'react';

const InvoicePreview = ({ invoice }) => {
    if (!invoice) return null;

    const {
        invoice_no,
        customer,
        issue_date,
        due_date,
        payment_method,
        items,
        subtotal,
        total,
        gst_status,
        notes
    } = invoice;

    return (
        <div className="bg-white max-w-[210mm] mx-auto min-h-[297mm] p-5 flex flex-col font-sans text-gray-900 shadow-2xl print:shadow-none print:p-0 print:m-0" id="invoice-preview-container">
            {/* The Bordered Content Area */}
            <div className="border-2 border-[#1B365D] p-5 flex-grow flex flex-col relative" id="invoice-preview">
                {/* Professional Inset Border Effect */}
                <div className="absolute inset-1 border border-[#1B365D]/10 pointer-events-none z-0"></div>

                {/* Watermark Container */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                    <img src="/images/logo.png" alt="" className="w-1/2" />
                </div>

                <div className="relative z-10 flex-grow flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <img src="/images/logo.png" alt="MAX FORCE PEST CONTROL" className="h-14" />
                    <div className="text-right">
                        <p className="text-xs font-semibold text-gray-600">Licence No: 5118162</p>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-base font-bold underline text-center tracking-widest mb-3 uppercase">Invoice</h1>

                {/* Client and Invoice Info Row */}
                <div className="flex justify-between items-start mb-4">
                    <div className="max-w-[50%] text-sm">
                        <div className="flex gap-1 mb-0.5">
                            <span className="font-bold whitespace-nowrap text-gray-700">CLIENT’S/Business Name:</span>
                            <span>{customer?.name}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="font-bold whitespace-nowrap text-gray-700">Address:</span>
                            <span>{customer?.address}</span>
                        </div>
                    </div>

                    <table className="border-collapse border border-gray-400 w-72">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 px-3 py-0.5 font-bold text-xs bg-gray-50/50 w-1/2 text-gray-700">Invoice No:</td>
                                <td className="border border-gray-400 px-3 py-0.5 text-xs text-center font-bold">{invoice_no}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-3 py-0.5 font-bold text-xs bg-gray-50/50 text-gray-700">Issue Date:</td>
                                <td className="border border-gray-400 px-3 py-0.5 text-xs text-center">{issue_date}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-3 py-0.5 font-bold text-xs bg-gray-50/50 text-gray-700">Due Date:</td>
                                <td className="border border-gray-400 px-3 py-0.5 text-xs text-center">{due_date || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-3 py-0.5 font-bold text-xs bg-gray-50/50 text-gray-700">Payment method:</td>
                                <td className="border border-gray-400 px-3 py-0.5 text-xs text-center">{payment_method || 'Bank Transfer'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border mt-14 border-gray-800 mb-4">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-50/30">
                            <th className="border border-gray-800 py-1.5 px-2 text-center font-bold text-xs w-[8%] text-gray-700">SN.</th>
                            <th className="border border-gray-800 py-1.5 px-4 text-center font-bold text-xs w-[47%] text-gray-700">Description</th>
                            <th className="border border-gray-800 py-1.5 px-2 text-center font-bold text-xs w-[10%] text-gray-700">Qty.</th>
                            <th className="border border-gray-800 py-1.5 px-2 text-center font-bold text-xs w-[15%] text-gray-700">Unit Price ($)</th>
                            <th className="border border-gray-800 py-1.5 px-2 text-center font-bold text-xs w-[20%] text-gray-700">Amount ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-gray-800 py-1.5 px-2 text-center align-middle font-bold text-xs">
                                    {index + 1}
                                </td>
                                <td className="border border-gray-800 py-1.5 px-4 align-top text-xs">
                                    <div className="font-bold mb-0.5">Pest control:</div>
                                    <div>{item.description}</div>
                                </td>
                                <td className="border border-gray-800 py-1.5 px-2 text-center align-middle font-bold text-xs text-gray-800">
                                    {item.qty}
                                </td>
                                <td className="border border-gray-800 py-1.5 px-2 text-center align-middle text-xs">
                                    {parseFloat(item.unit_price).toFixed(2)}
                                </td>
                                <td className="border border-gray-800 py-1.5 px-2 text-center align-middle font-bold text-xs text-gray-900">
                                    {parseFloat(item.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Subtotal and Total */}
                <div className="flex flex-col items-end mb-4">
                    <div className="flex gap-8 mb-1 text-xs">
                        <span className="font-bold text-gray-700">Subtotal:</span>
                        <span className="min-w-[80px] text-right font-semibold">{parseFloat(subtotal).toFixed(2)}</span>
                    </div>
                    <div className="w-64 border-t border-gray-300 mb-2"></div>
                    <div className="flex gap-8 items-baseline">
                        <span className="font-bold text-base text-gray-800">Total (AUD):</span>
                        <span className="text-xl font-bold min-w-[100px] text-right">{parseFloat(total).toFixed(2)}</span>
                    </div>
                </div>

                {/* GST Note */}
                <div className="text-center mb-4 italic text-[10px] text-gray-600">
                    {gst_status ? 'Inclusive of GST.' : 'This invoice is exclusive of GST.'}
                </div>

                {/* Account Details */}
                <div className="mb-4">
                    <h4 className="font-bold underline mb-2 text-sm text-gray-800">
                        Account Details:
                    </h4>

                    <div className="grid grid-cols-[140px_auto] gap-y-1 text-xs">
                        <span className="font-bold text-gray-600">Account Name:</span>
                        <span className="font-semibold text-gray-900">Bibek Jung Bogati</span>

                        <span className="font-bold text-gray-600">BSB:</span>
                        <span className="font-semibold text-gray-900">067873</span>

                        <span className="font-bold text-gray-600">Account Number:</span>
                        <span className="font-semibold text-gray-900">23377736</span>

                        <span className="font-bold text-gray-600 whitespace-nowrap">Bank Name:</span>
                        <span className="font-semibold text-gray-900">Commonwealth Bank of Australia</span>
                    </div>
                </div>

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow"></div>

                {/* Footer Section */}
                <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                    <div className="text-[10px] leading-relaxed text-gray-500">
                        <p className="font-bold text-gray-700">MAX FORCE PEST CONTROL</p>
                        <p>36 Thoroughbred Dr, COBBITTY</p>
                        <p>NSW 2570 Australia</p>
                        <p className="font-bold text-gray-700">0452651431</p>
                    </div>
                    <div className="text-[10px] font-bold text-gray-700">
                        ABN: 38837579583
                    </div>
                    <div className="text-[10px] text-right text-gray-500">
                        <p><span className="italic mr-1 text-gray-400">web:</span> <span className="font-bold text-gray-700">www.maxforcepest.com.au</span></p>
                    </div>
                </div>
            </div>
        </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #invoice-preview, #invoice-preview * {
                        visibility: visible;
                    }
                    #invoice-preview {
                        position: absolute;
                        left: 5mm;
                        top: 5mm;
                        width: 200mm;
                        height: 287mm;
                        padding: 20px;
                        margin: 0;
                        box-shadow: none;
                        display: flex;
                        flex-direction: column;
                        border: 1.5pt solid #1B365D !important;
                        outline: 0.5pt solid rgba(27, 54, 93, 0.2) !important;
                        outline-offset: -2.5pt !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
};

export default InvoicePreview;
