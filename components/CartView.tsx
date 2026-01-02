import React, { useState } from 'react';
import { ArrowLeft, Trash2, ShieldCheck, ShoppingBag, CreditCard, Minus, Plus } from 'lucide-react';

interface CartViewProps {
    onBack: () => void;
    onCheckout: () => void;
}

interface CartItem {
    id: number;
    name: string;
    brand: string;
    size: string;
    price: number;
    image: string;
    color: string;
    quantity: number;
}

export const CartView: React.FC<CartViewProps> = ({ onBack, onCheckout }) => {
    // Mock Data simulating "Magic Import"
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: "Dunk Low Retro",
            brand: "Nike",
            size: "UK 9",
            price: 109.95,
            image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcbca4-e853-4df7-b329-5be3c61ee057/dunk-low-retro-shoe-66RGqF.png",
            color: "White/Black",
            quantity: 1
        },
        {
            id: 2,
            name: "Sportswear Club Fleece",
            brand: "Nike",
            size: "L",
            price: 54.95,
            image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/6bd7a1c4-3c36-4e56-9b63-12503940d9d2/sportswear-club-fleece-pullover-hoodie-Gw4Nwq.png",
            color: "Black",
            quantity: 1
        }
    ]);

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(items => items.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const serviceFee = cartItems.length > 0 ? 4.99 : 0;
    const deliveryFee = cartItems.length > 0 ? 5.95 : 0;
    const total = subtotal + serviceFee + deliveryFee;

    return (
        <div className="min-h-screen bg-gray-50 font-sans animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center text-xs md:text-sm font-bold text-gray-500 hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                        <span className="hidden sm:inline">Continue Shopping</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <h1 className="text-base md:text-xl font-bold">Your Basket</h1>
                    <div className="w-12 md:w-20"></div> {/* Spacer for centering */}
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-12">
                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your basket is empty</h2>
                        <p className="text-gray-500 mb-8">Start shopping to add items to your basket.</p>
                        <button
                            onClick={onBack}
                            className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-12">

                        {/* Left: Cart Items */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                                <h2 className="text-lg md:text-2xl font-bold">Imported Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h2>
                                <span className="text-xs md:text-sm text-green-600 flex items-center font-medium bg-green-50 px-2 md:px-3 py-1 rounded-full border border-green-100 w-fit">
                                    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" />
                                    Verified by Tenbox
                                </span>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 md:gap-6 group">
                                        {/* Image Placeholder */}
                                        <div className="w-full sm:w-24 md:w-32 h-24 md:h-32 bg-gray-100 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                            <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-white opacity-50"></div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold text-gray-400 mb-0.5 md:mb-1">{item.brand}</p>
                                                    <h3 className="font-bold text-base md:text-lg text-gray-900">{item.name}</h3>
                                                    <div className="text-xs md:text-sm text-gray-500 mt-1 space-x-2 md:space-x-3">
                                                        <span>Size: {item.size}</span>
                                                        <span>•</span>
                                                        <span>{item.color}</span>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-base md:text-lg">£{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Right: Order Summary */}
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 sticky top-20 md:top-28">
                                <h3 className="text-lg md:text-xl font-bold mb-5 md:mb-8">Order Summary</h3>

                                <div className="space-y-3 md:space-y-4 mb-5 md:mb-8 text-sm md:text-base">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-black">£{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="font-bold text-black">£{deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Service Fee</span>
                                        <span className="font-bold text-black">£{serviceFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 md:pt-6 mb-5 md:mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-900 font-bold text-base md:text-xl">Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl md:text-3xl font-black block">£{total.toFixed(2)}</span>
                                            <span className="text-xs text-gray-400 font-medium">Including VAT</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onCheckout}
                                    disabled={cartItems.length === 0}
                                    className="w-full bg-black text-white py-3.5 md:py-5 rounded-full font-bold text-sm md:text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span>Checkout & Deliver</span>
                                </button>

                                <div className="mt-6 flex items-center justify-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Secure Checkout</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};
