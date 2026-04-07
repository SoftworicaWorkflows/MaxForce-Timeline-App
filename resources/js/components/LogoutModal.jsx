import React, { useEffect, useCallback } from 'react';
import { LogOut, X, AlertTriangle, Power, User, Clock, Shield } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm, userName, lastLogin }) {
    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Prevent background from scrolling on mobile
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    // Handle confirm with keyboard
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            onConfirm();
        }
    }, [onConfirm]);

    if (!isOpen) return null;

    // Get current time for greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop with blur effect */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
                onClick={onClose} 
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div 
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-8 fade-in zoom-in-95"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-modal-title"
                aria-describedby="logout-modal-description"
            >
               

                {/* Content Section */}
                <div className="p-8">
                    {/* Icon */}
                   

                    {/* Text Content */}
                    <div className="text-center mb-8">
                        <h4 className="text-xl font-black text-[#1B365D] mb-2">
                            Ready to leave?
                        </h4>
                        <p 
                            id="logout-modal-description"
                            className="text-sm font-medium text-gray-500 leading-relaxed"
                        >
                            Are you sure you want to end your current session?
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-200 text-xs uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-3 bg-[#1B365D] hover:bg-[#1B365D]/90 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 text-xs uppercase tracking-wider"
                            autoFocus
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Add global styles for animations if not present */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-in {
                    animation-duration: 0.3s;
                    animation-fill-mode: both;
                }
                
                .fade-in {
                    animation-name: fadeIn;
                }
                
                .slide-in-from-bottom-8 {
                    animation-name: slideInFromBottom;
                }
                
                .zoom-in-95 {
                    animation-name: zoomIn;
                }
            `}</style>
        </div>
    );
}