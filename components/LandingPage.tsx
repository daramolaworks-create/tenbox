import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { GlobalFooter } from './GlobalFooter';
import {
    ArrowRight,
    Package,
    ShoppingBag,
    CheckCircle2,
    Globe2,
    PackageMinus,
    FileWarning,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden">

            {/* Navbar - Absolute over Hero */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 md:py-8">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <img src="/tenbox-logo.png" alt="Tenbox" className="h-8 md:h-10" />
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white/80 hover:text-white font-medium text-sm transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all hidden md:block shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* 1. Hero Section - Clean "Ship it / Shop it" Concept */}
            <section className="bg-[#050B14] text-white relative overflow-hidden min-h-[85vh] flex items-center">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="/hero-delivery.jpg"
                        alt="Global Lifestyle"
                        className="w-full h-full object-cover opacity-70 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/80 via-[#050B14]/40 to-[#050B14]"></div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-24 relative z-10 w-full">

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-2 gap-12 items-center">

                        {/* Left Side - Shop */}
                        <div className="space-y-8 text-left">
                            <div>
                                <h1 className="text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-none">
                                    Shop it
                                </h1>
                                <p className="text-xl text-gray-400 mt-6 max-w-md leading-relaxed">
                                    Buy from Amazon, Apple, Nike and more. We handle shopping, shipping, and customs.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-bold transition-all inline-flex items-center"
                            >
                                Start Shopping
                            </button>
                        </div>

                        {/* Right Side - Ship */}
                        <div className="space-y-8 text-right">
                            <div>
                                <h1 className="text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-none">
                                    Ship it
                                </h1>
                                <p className="text-xl text-gray-400 mt-6 max-w-md ml-auto leading-relaxed">
                                    Send packages anywhere in the world. Compare couriers, get instant quotes, and book in seconds.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all inline-flex items-center group"
                            >
                                Get Shipping Quote
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden text-center space-y-10">
                        <div>
                            <h1 className="text-6xl font-bold tracking-tighter text-white leading-none mb-2">
                                Shop it
                            </h1>
                            <span className="text-4xl text-gray-500 font-bold">&</span>
                            <h1 className="text-6xl font-bold tracking-tighter text-white leading-none mt-2">
                                Ship it
                            </h1>
                        </div>

                        <p className="text-lg text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Shop from global stores or send packages worldwide. One platform for everything.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white text-black px-8 py-4 rounded-full font-bold w-full"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold w-full"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Central Visual Element (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                        <div className="relative">
                            {/* Floating Status Card */}
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl shadow-2xl">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Package Status</p>
                                        <p className="font-bold text-white text-lg">Delivered</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


            </section>


            {/* 2. Problem Section - Relatable & Clean */}
            <section className="py-20 md:py-32 px-6 bg-white border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto">
                    <div className="max-w-3xl mb-16 md:mb-24 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Global shipping shouldn't feel this hard.</h2>
                        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl">
                            We've all been there — confusing customs forms, surprise fees, and brands that just won't ship to you. We fixed it.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe2 className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">The "No Shipping" Wall</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                "Sorry, we don't ship to your country." The most annoying sentence on the internet. We give you a US/UK address so you can shop anywhere.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <PackageMinus className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Sending Care Packages</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Trying to figure out which courier is cheapest, safest, or fastest involves 10 open tabs. We compare them all instantly.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileWarning className="w-7 h-7 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">The Customs Headache</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Stuck at the border? Unexpected fees? We handle the paperwork so your package doesn't get held hostage.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Lifestyle Split Section (The "Shift") */}
            <section className="py-20 md:py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    <div className="flex-1 order-2 md:order-1 relative">
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1556740758-90de2929450a?q=80&w=1000&auto=format&fit=crop"
                                alt="Happy shopper receiving package"
                                className="w-full h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 text-white">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">Delivered today</span>
                                </div>
                                <p className="font-bold text-xl">From London to Lagos</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 order-1 md:order-2">
                        <span className="inline-block py-1.5 px-4 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide uppercase mb-6">Simple & Transparent</span>
                        <h2 className="text-3xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                            We handle the messy logistics.
                        </h2>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Tenbox isn't just a shipping company. We're your personal logistics team. Whether you're moving parcels or importing that designer jacket, we find the best route, handle the customs, and get it to your door.
                        </p>
                        <div className="flex items-center space-x-4 text-sm font-bold text-gray-900">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                            </div>
                            <span className="text-gray-500 font-medium">Join thousands shipping daily</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Two Ways to Use Tenbox - Visual Cards */}
            <section className="py-20 md:py-32 px-6 bg-[#F5F5F7]">
                <div className="max-w-[1200px] mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight text-gray-900">Two ways to use Tenbox</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Method 1: Ship */}
                        <div className="group relative bg-white rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between hover:shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0">
                                <img
                                    src="https://images.unsplash.com/photo-1566576912906-253c720f4d3c?q=80&w=1000&auto=format&fit=crop"
                                    className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-105 group-hover:scale-100"
                                    alt="Shipping boxes"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent"></div>
                            </div>

                            <div className="relative p-10 md:p-12">
                                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg">
                                    <Package className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-gray-900">Ship a Parcel</h3>
                                <p className="text-gray-500 text-lg leading-relaxed">
                                    Sending a gift or package? Tell us where it's going, and we'll show you the best courier options instantly.
                                </p>
                            </div>

                            <div className="relative p-10 md:p-12 pt-0">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-black text-white px-8 py-4 rounded-full font-bold w-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-between group-hover:px-10"
                                >
                                    Ship Now
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>

                        {/* Method 2: Shop */}
                        <div className="group relative bg-white rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between hover:shadow-2xl transition-all duration-500">
                            <div className="absolute inset-0">
                                <img
                                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop"
                                    className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-105 group-hover:scale-100"
                                    alt="Shopping bags"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent"></div>
                            </div>

                            <div className="relative p-10 md:p-12">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-blue-200">
                                    <ShoppingBag className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-gray-900">Shop Global Stores</h3>
                                <p className="text-gray-500 text-lg leading-relaxed">
                                    See something you like on Amazon, Apple, or ASOS? Paste the link, and we'll buy and ship it to you.
                                </p>
                            </div>

                            <div className="relative p-10 md:p-12 pt-0">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold w-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl flex items-center justify-between group-hover:px-10"
                                >
                                    Start Shopping
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. How It Works - Clean Flow */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How it works</h2>
                        <p className="text-gray-500 text-lg">Four simple steps to get your items moving.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>

                        {[
                            { step: 1, title: "Tell us what", desc: "Paste a product link or describe your parcel." },
                            { step: 2, title: "See your options", desc: "We instantly compare routes and prices." },
                            { step: 3, title: "We handle it", desc: "We book the courier or buy the item." },
                            { step: 4, title: "Track & Relax", desc: "Watch your item travel to your doorstep." }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center bg-white">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-xl mb-6 border-4 border-gray-50 shadow-sm z-10 text-gray-900">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed px-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Technical/Trust - Replaced with "Peace of Mind" */}
            <section className="py-24 px-6 bg-[#050B14] text-white rounded-[3rem] mx-4 md:mx-6 my-6 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="World map tech" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent"></div>

                <div className="max-w-[1000px] mx-auto relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Built for peace of mind.</h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-light">
                        Multiple shipments? Different countries? No problem. <br /> See everything on one screen, clearly tracked and organized.
                    </p>

                    {/* Simulated UI Card instead of Schematic */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 max-w-2xl mx-auto border border-white/10 shadow-2xl text-left">
                        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Order #TX-9281</p>
                                    <p className="text-xs text-green-400">Arriving Tomorrow</p>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-gray-400">Carrier</p>
                                <p className="font-bold text-white">DHL Express</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 bg-black/20 p-3 rounded-lg">
                                <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="w-8" alt="Amazon" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">Sony WH-1000XM5 Headphones</p>
                                    <p className="text-xs text-gray-400">Imported from USA</p>
                                </div>
                                <span className="text-white font-bold text-sm">On Time</span>
                            </div>

                            <div className="flex items-center space-x-4 bg-black/20 p-3 rounded-lg opacity-60">
                                <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center text-black font-bold text-xs">
                                    NIKE
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">Air Jordan 1 Low</p>
                                    <p className="text-xs text-gray-400">Imported from UK</p>
                                </div>
                                <span className="text-gray-300 font-bold text-sm">Delivered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Trust - Logos (Cleaner) */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-[1000px] mx-auto text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">Trusted Global Partners</p>

                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-3xl font-bold font-sans tracking-tighter">DHL</span>
                        <span className="text-3xl font-bold font-serif italic">FedEx</span>
                        <span className="text-3xl font-bold font-serif">UPS</span>
                        <span className="text-3xl font-bold font-sans tracking-tight">DPD</span>
                        <span className="text-3xl font-bold font-mono">USPS</span>
                    </div>
                </div>
            </section>

            {/* 8. CTA Reinforcement */}
            <section className="py-24 md:py-32 px-6 bg-white text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tighter">Start shipping smarter.</h2>
                    <p className="text-xl text-gray-500 mb-10 font-light">Join the new standard for global logistics.</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                        >
                            Get a Quote
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full md:w-auto bg-white border border-gray-200 text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-50 transition-all"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </section>

            {/* 9. Footer */}
            <GlobalFooter />
        </div>
    );
};
