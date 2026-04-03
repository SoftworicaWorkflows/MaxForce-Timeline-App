import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-16 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                    <a
                        href="https://softworica.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-[#8CC63F] transition-colors"
                    >
                        <img
                            src="https://softworica.com/images/logo.png"
                            alt="Softworica Logo"
                            className="h-6 w-auto"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="font-semibold">Created by Softworica</span>
                        <ExternalLink size={16} />
                    </a>
                </div>
                <p className="text-center text-gray-400 text-sm mt-4">
                    © 2024 MaxForce. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
