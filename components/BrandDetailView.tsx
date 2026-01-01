import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Star, ArrowRight, ShoppingBag, CreditCard, Smartphone } from 'lucide-react';

interface BrandDetailViewProps {
    brand: any;
    onBack: () => void;
}

export const BrandDetailView: React.FC<BrandDetailViewProps> = ({ brand, onBack }) => {

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans animate-in slide-in-from-right duration-500">

            {/* 1. HERO SECTION (Custom Brand Color) */}
            <div className={`${brand.heroColor} ${brand.textColor} relative overflow-hidden`}>
                <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-20 md:py-24 relative z-10">

                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-2 text-sm opacity-70 mb-12 font-medium">
                        <button onClick={onBack} className="hover:opacity-100 transition-opacity">Start</button>
                        <span>/</span>
                        <button onClick={onBack} className="hover:opacity-100 transition-opacity">Store</button>
                        <span>/</span>
                        <span>{brand.name.toLowerCase()}</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
                        <div>
                            {/* Brand Logo */}
                            <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg overflow-hidden ${brand.name === 'boohoo' ? '' : 'p-4'}`}>
                                <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className={`w-full h-full object-contain ${brand.name === 'boohoo' ? '' : 'mix-blend-multiply'}`}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerText = brand.name[0];
                                    }}
                                />
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{brand.name}</h1>
                            <div className="flex items-center space-x-2 text-lg opacity-90">
                                <span>Simply select</span>
                                <span className="bg-black text-white px-2 py-0.5 rounded font-bold text-sm">Tenbox</span>
                                <span>at checkout</span>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-0">
                            <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center space-x-2 shadow-xl">
                                <span>Go to {brand.name.toLowerCase()}</span>
                                <ExternalLink className="w-5 h-5 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* 2. HOW IT WORKS SECTION */}
            <div className="max-w-[1100px] mx-auto px-6 py-20 md:py-32">
                <div className="flex flex-col md:flex-row items-center justify-between gap-16">

                    {/* Left Content */}
                    <div className="flex-1 space-y-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-12 leading-tight">
                                How to Check Out and Get Delivery with Tenbox at {brand.name}
                            </h2>

                            <div className="space-y-10">
                                <div className="group">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">1. Start from Tenbox</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">Click the Tenbox link to visit the brand’s website.</p>
                                </div>

                                <div className="group">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">2. Add items to your cart</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">Shop as usual on the brand’s site and add the products you want to your cart.</p>
                                </div>

                                <div className="group">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">3. Return to Tenbox</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">Once you’re done shopping, close the browser. Your selected items will appear in your Tenbox cart automatically. Proceed to checkout.</p>
                                </div>

                                <div className="group">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">4. Choose delivery and pay</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">Select your preferred delivery option, review your shipment details, and complete payment.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs text-gray-400 mb-8 max-w-md">
                                *The available payment options depend on the store and the total purchase amount.
                            </p>
                            <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors inline-flex items-center">
                                Go to {brand.name.toLowerCase()}
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>

                    {/* Right Mobile Mockup */}
                    <div className="flex-1 flex justify-center md:justify-end">
                        <div className="relative border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                            <div className="h-[32px] bg-gray-800 w-full absolute top-0 left-0 rounded-t-[2.5rem] z-20"></div>
                            <div className="h-[4px] w-[60px] bg-gray-700 absolute top-2 left-1/2 -translate-x-1/2 rounded-full z-30"></div>

                            {/* Screen Content */}
                            <div className="flex-1 bg-white pt-10 px-4 relative overflow-hidden flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="font-bold text-xl">{brand.name}</div>
                                    <ShoppingBag className="w-5 h-5" />
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl mb-6 flex items-center justify-center">
                                    <Smartphone className="w-32 h-32 text-gray-300" />
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>

                                <div className="mt-auto mb-8 space-y-3">
                                    <div className="bg-black text-white p-4 rounded-xl flex items-center justify-between text-sm font-bold">
                                        <span>Checkout & deliver with</span>
                                        <span className="bg-white text-black px-1.5 rounded textxs font-bold">Tenbox</span>
                                    </div>
                                    <div className="bg-gray-100 text-gray-500 p-4 rounded-xl text-center text-sm font-bold">
                                        Add to Cart
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 3. REVIEWS SECTION */}
            <div className="bg-[#FAFAFA] py-20 border-t border-gray-100">
                <div className="max-w-[1200px] mx-auto px-6">

                    <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                        <div>
                            <div className="flex items-center space-x-2 text-green-500 mb-2">
                                <Star className="w-8 h-8 fill-current" />
                                <span className="font-bold text-2xl text-black">Trustpilot</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-6 h-6 bg-green-500 flex items-center justify-center"><Star className="w-4 h-4 text-white fill-current" /></div>)}
                            </div>
                            <p className="text-sm mt-2 font-medium">
                                TrustScore <strong>{brand.trustScore}</strong> | <strong>{brand.reviewCount}</strong> reviews
                            </p>
                        </div>

                        <div className="text-center md:text-right mt-8 md:mt-0 max-w-lg">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join millions who use Tenbox at {brand.name} and other stores</h2>
                            <p className="text-gray-500">111+ million people love to shop and pay with Tenbox anywhere.</p>
                        </div>
                    </div>

                    {/* Reviews Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { text: "Tenbox are brilliant! Very helpful when I had to send a product back. Very reassuring and easy to manage payment plan.", author: "Donna", date: "1st of June 2025" },
                            { text: "Excellent customer service. I was so pleased with their efficiency in dealing with my issue.", author: "Kelle S", date: "3rd of June 2025" },
                            { text: "Tenbox is my favorite way to pay in installments at such a huge variety of stores. Shopping on apps and in store is super easy.", author: "KadijahLove", date: "8th of June 2025" }
                        ].map((review, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex space-x-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-black fill-current" />)}
                                </div>
                                <p className="text-gray-800 font-medium leading-relaxed mb-6 min-h-[80px]">"{review.text}"</p>
                                <p className="text-sm text-gray-400 font-medium">{review.author} - {review.date}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-6 space-x-2">
                        <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                            <ArrowRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};
