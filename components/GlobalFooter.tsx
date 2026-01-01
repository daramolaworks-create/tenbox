import React, { useState, useRef, useEffect } from 'react';
import { Facebook, Linkedin, Twitter, Instagram, Globe, ChevronDown, Check } from 'lucide-react';

export const GlobalFooter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('United Kingdom');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const countries = ['United Kingdom', 'United Arab Emirates', 'United States'];

    return (
        <footer className="bg-[#130c43] text-white pt-20 pb-10 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Top Section: Links & Market */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-24">

                    {/* Market Selector */}
                    <div className="lg:col-span-1" ref={dropdownRef}>
                        <h3 className="font-bold text-lg mb-6">Market</h3>
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-4 py-2 text-sm font-medium w-full md:w-auto justify-between md:justify-start group"
                            >
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4" />
                                    <span>{selectedCountry}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1250] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="py-1">
                                        {countries.map((country) => (
                                            <button
                                                key={country}
                                                onClick={() => {
                                                    setSelectedCountry(country);
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center justify-between group"
                                            >
                                                <span>{country}</span>
                                                {selectedCountry === country && (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tenbox Links */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg mb-6">Tenbox</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                        </ul>
                    </div>

                    {/* Customer Links */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg mb-6">Customer</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Customer service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Track a package</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Store Directory</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Business Links */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg mb-6">Business</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Merchant support</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Partner with us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Business login</a></li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold text-lg mb-6">Follow</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Giant Typography */}
                <div className="border-t border-gray-800 pt-16 mb-8">
                    <h1
                        className="text-[12vw] leading-none font-bold tracking-tighter text-center select-none footer-logo-text"
                        style={{ fontFamily: "'Aspire-Font', sans-serif" }}
                    >
                        Tenbox
                    </h1>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 pt-8 border-t border-gray-800">
                    <p className="mb-4 md:mb-0 max-w-2xl">
                        Copyright © 2025 Tenbox Ltd. All rights reserved. Tenbox is authorised and regulated by the Financial Conduct Authority.
                        Registered office: 10 York Road, London, SE1 7ND.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-white transition-colors">Cookie policy</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                        <a href="#" className="hover:text-white transition-colors">Tenbox.com</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
