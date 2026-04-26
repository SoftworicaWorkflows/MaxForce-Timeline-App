import React from 'react';
import { AlertCircle, CheckCircle, X, Phone, Mail, MapPin } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "warning", // 'warning', 'info', 'success', 'phone', 'mail', 'address'
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'phone':
                return <Phone size={24} className="text-blue-600" />;
            case 'mail':
                return <Mail size={24} className="text-[#8CC63F]" />;
            case 'address':
                return <MapPin size={24} className="text-orange-600" />;
            case 'success':
                return <CheckCircle size={24} className="text-green-600" />;
            case 'info':
                return <AlertCircle size={24} className="text-blue-600" />;
            case 'warning':
            default:
                return <AlertCircle size={24} className="text-red-600" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'phone':
                return 'bg-blue-100';
            case 'mail':
                return 'bg-[#8CC63F]/10';
            case 'address':
                return 'bg-orange-100';
            case 'success':
                return 'bg-green-100';
            case 'info':
                return 'bg-blue-100';
            case 'warning':
            default:
                return 'bg-red-100';
        }
    };

    const getConfirmBtnClass = () => {
        switch (type) {
            case 'phone':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'mail':
                return 'bg-[#8CC63F] hover:bg-[#7ab336]';
            case 'address':
                return 'bg-orange-600 hover:bg-orange-700';
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'warning':
            default:
                return 'bg-red-600 hover:bg-red-700';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`w-12 h-12 ${getIconBg()} rounded-full flex items-center justify-center`}>
                            {getIcon()}
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm ${getConfirmBtnClass()}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
