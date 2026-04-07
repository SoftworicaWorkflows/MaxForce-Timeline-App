import React from 'react';
import { LogOut, X, AlertTriangle, Power } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    // Handle escape key press
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ animation: 'fadeIn 0.2s ease-out' }}
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div 
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* Header Section */}
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <LogOut size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Logout</h3>
                                <p className="text-xs text-white/80 mt-0.5">End your session</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/70 hover:text-white"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    {/* Warning Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                            <AlertTriangle size={36} className="text-red-500" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Ready to leave?
                        </h4>
                        <p className="text-sm text-gray-600">
                            You'll need to sign in again to access your account and dashboard.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button 
                            type="button"
                            onClick={onConfirm}
                            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <Power size={18} />
                            <span>Yes, Logout</span>
                        </button>
                        
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}