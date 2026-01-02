import React, { useState } from 'react';
import { Search, ArrowLeft, Filter, ExternalLink } from 'lucide-react';

interface StoreDirectoryProps {
    onBack: () => void;
    onSelectStore?: (store: Store) => void;
}

export interface Store {
    id: string;
    name: string;
    category: string;
    description?: string;
    color: string;
    heroColor: string;
    textColor: string;
    trustScore: number;
    reviewCount: string;
    isLarge?: boolean;
    logoUrl?: string;
    coverUrl?: string; // Added coverImageUrl property
}

const stores: Store[] = [
    {
        id: '1',
        name: 'Sports Direct',
        category: 'Sports',
        color: 'bg-blue-600',
        heroColor: 'bg-[#003399]',
        textColor: 'text-white',
        trustScore: 4.2,
        reviewCount: '155,902',
        isLarge: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Sports_Direct_Logo.svg/1200px-Sports_Direct_Logo.svg.png',
        coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600', // Runners
        description: "The UK's #1 sports retailer. Shop huge brands like Nike, Adidas, Puma and more."
    },
    {
        id: '2',
        name: 'Back Market',
        category: 'Electronics',
        color: 'bg-green-400',
        heroColor: 'bg-[#000000]',
        textColor: 'text-white',
        trustScore: 4.5,
        reviewCount: '52,102',
        isLarge: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Back_Market_logo.svg/1200px-Back_Market_logo.svg.png',
        coverUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600', // Electronics
        description: "Refurbished tech at up to 70% off. Good for your wallet, good for the planet."
    },
    {
        id: '3',
        name: 'Nike',
        category: 'Sports',
        color: 'bg-black',
        heroColor: 'bg-[#111111]',
        textColor: 'text-white',
        trustScore: 4.1,
        reviewCount: '28,932',
        isLarge: true,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
        coverUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', // Red Nike Shoe
        description: "Just Do It. Innovative sportswear, shoes and accessories for every athlete."
    },
    {
        id: '4',
        name: 'Amazon',
        category: 'Marketplace',
        color: 'bg-orange-400',
        heroColor: 'bg-[#232f3e]',
        textColor: 'text-white',
        trustScore: 3.8,
        reviewCount: '1,200,992',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        coverUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=600', // Packages
        description: "Free delivery on millions of items with Prime. Low prices across earth's biggest selection."
    },
    {
        id: '5',
        name: 'Argos',
        category: 'Department Store',
        color: 'bg-red-600',
        heroColor: 'bg-[#DA291C]',
        textColor: 'text-white',
        trustScore: 4.3,
        reviewCount: '89,201',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Argos_logo.svg',
        coverUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=600', // Shopping
        description: "Get it today. thousands of products available for same day delivery or collection."
    },
    {
        id: '6',
        name: 'JD Sports',
        category: 'Sports',
        color: 'bg-black',
        heroColor: 'bg-[#FFD100]',
        textColor: 'text-black',
        trustScore: 4.0,
        reviewCount: '92,110',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/JD_Sports_logo.svg/1200px-JD_Sports_logo.svg.png',
        coverUrl: 'https://images.unsplash.com/photo-1520316587275-5e4f06f355e6?auto=format&fit=crop&q=80&w=600', // Sneakers
        description: "Undisputed King of Trainers. Exclusive sneakers and apparel from top brands."
    },
    {
        id: '7',
        name: 'Currys',
        category: 'Electronics',
        color: 'bg-purple-800',
        heroColor: 'bg-[#2C004F]',
        textColor: 'text-white',
        trustScore: 4.1,
        reviewCount: '34,200',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Currys_logo.png',
        coverUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f3c6?auto=format&fit=crop&q=80&w=600', // Laptops
        description: "Tech experts. TVs, washing machines, cookers, cameras, laptops, tablets and more."
    },
    {
        id: '8',
        name: 'eBay',
        category: 'Marketplace',
        color: 'bg-green-600',
        heroColor: 'bg-[#86B817]',
        textColor: 'text-black',
        trustScore: 3.9,
        reviewCount: '500,000+',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
        coverUrl: 'https://images.unsplash.com/photo-1561715276-a2d087482bf5?auto=format&fit=crop&q=80&w=600', // Variety
        description: "Buy and sell electronics, cars, fashion apparel, collectibles, sporting goods and more."
    },
    {
        id: '9',
        name: 'John Lewis',
        category: 'Department Store',
        color: 'bg-gray-800',
        heroColor: 'bg-[#153443]',
        textColor: 'text-white',
        trustScore: 4.6,
        reviewCount: '102,993',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/John_Lewis_%26_Partners.svg/1200px-John_Lewis_%26_Partners.svg.png',
        coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600', // Dept store
        description: "High quality products from John Lewis & Partners. Home, Fashion, Electricals and more."
    },
    {
        id: '10',
        name: 'Asos',
        category: 'Fashion',
        color: 'bg-white border-black',
        heroColor: 'bg-black',
        textColor: 'text-white',
        trustScore: 4.4,
        reviewCount: '300,102',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/ASOS_logo.svg',
        coverUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600', // Fashion model
        description: "Discover the latest fashion trends with ASOS. Shop the new collection of clothing and more."
    },
    {
        id: '11',
        name: 'boohoo',
        category: 'Fashion',
        color: 'bg-black',
        heroColor: 'bg-black',
        textColor: 'text-white',
        trustScore: 3.7,
        reviewCount: '45,200',
        logoUrl: '/boohoo-logo.png',
        coverUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600', // Fashion Street style
        description: "Twenty-four seven fashion. The latest styles for women and men."
    },
    {
        id: '12',
        name: 'Apple',
        category: 'Electronics',
        color: 'bg-gray-800',
        heroColor: 'bg-[#000000]',
        textColor: 'text-white',
        trustScore: 4.8,
        reviewCount: '15,670',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        description: "Discover the innovative world of Apple and shop everything iPhone, iPad, Apple Watch, Mac, and Apple TV."
    },
];



export const StoreDirectory: React.FC<StoreDirectoryProps> = ({ onBack, onSelectStore }) => {
    const [activeCategory, setActiveCategory] = useState('All categories');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStores = stores.filter(store => {
        const matchesCategory = activeCategory === 'All categories' || store.category === activeCategory;
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 animate-in slide-in-from-right duration-300">
            <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-8">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center text-xs md:text-sm font-bold text-gray-500 hover:text-black transition-colors mb-4 md:mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shop
                </button>

                {/* Hero Section */}
                <div className="text-center mb-8 md:mb-16 relative">
                    {/* Floating Logos Background Effect (simplified) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                        <div className="absolute top-0 left-10 w-20 h-20 bg-red-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 md:mb-6 max-w-3xl mx-auto leading-tight px-2">
                        Deliver your favourite brands with Tenbox
                    </h1>
                    <p className="text-sm md:text-lg text-gray-500 mb-6 md:mb-10">
                        Flexible payment options everywhere you shop.
                    </p>

                    <div className="max-w-2xl mx-auto relative px-2 md:px-0">
                        <input
                            type="text"
                            placeholder="Search for stores"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-full border border-gray-200 shadow-sm text-sm md:text-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 mb-10">
                    <div className="relative">
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-full py-3 pl-6 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All categories">All categories</option>
                            {Array.from(new Set(stores.map(s => s.category))).sort().map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>

                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                        Showing {filteredStores.length} stores
                    </span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map(store => (
                        <div
                            key={store.id}
                            onClick={() => { console.log('Store clicked:', store.name); onSelectStore && onSelectStore(store); }}
                            className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer ${store.isLarge ? 'md:col-span-1 row-span-1' : ''
                                }`}
                        >
                            <div
                                className={`h-40 relative p-6 flex flex-col justify-between bg-cover bg-center ${store.color}`}
                                style={store.coverUrl ? { backgroundImage: `url(${store.coverUrl})` } : {}}
                            >
                                {/* Visual Pattern overlay - Standardized dark gradient for text/logo pop */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>

                                <div className="absolute bottom-4 left-4">
                                    <div className={`bg-white w-12 h-12 rounded-lg shadow-md flex items-center justify-center overflow-hidden ${store.name === 'boohoo' ? '' : 'p-2'}`}>
                                        {store.logoUrl ? (
                                            <img
                                                src={store.logoUrl}
                                                alt={store.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerText = store.name.substring(0, 1);
                                                }}
                                            />
                                        ) : (
                                            <span className="font-bold text-xl">{store.name.substring(0, 1)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {store.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{store.category}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Tenbox at checkout
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
};
