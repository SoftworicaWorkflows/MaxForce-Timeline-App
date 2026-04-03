import React, { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';

const Header = ({ onAdminClick }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <header className="bg-gradient-to-r from-[#1B365D] to-[#0f1f38] text-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Name */}
                    <div className="flex items-center gap-3">
                        <img
                            src="https://maxforcepest.com.au/logo.png"
                            alt="MaxForce Logo"
                            className="h-10 w-auto"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div>
                            <h1 className="text-2xl font-bold">MaxForce</h1>
                            <p className="text-xs text-gray-300">Schedule Booking</p>
                        </div>
                    </div>

                    {/* Admin Button */}
                    <button
                        onClick={onAdminClick}
                        className="hidden sm:flex items-center gap-2 bg-[#8CC63F] text-[#1B365D] px-4 py-2 rounded-lg font-semibold hover:bg-[#7ab330] transition-colors shadow-md"
                    >
                        <LogIn size={18} />
                        Admin Panel
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="sm:hidden p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                    >
                        {showMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {showMenu && (
                    <div className="mt-4 sm:hidden">
                        <button
                            onClick={() => {
                                onAdminClick();
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-[#8CC63F] text-[#1B365D] px-4 py-2 rounded-lg font-semibold hover:bg-[#7ab330] transition-colors"
                        >
                            <LogIn size={18} />
                            Admin Panel
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
