import React, { useState } from 'react';
import { AddressAutocomplete } from './AddressAutocomplete';
import { QuoteSelection } from './QuoteSelection';
import { generateQuotes } from '../services/gemini';
import { Quote } from '../types';
import { Scale, Ruler, Package, MapPin } from 'lucide-react';

interface BookingViewProps {
    onBook: (quote: Quote) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ onBook }) => {
    // Booking State
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [itemDesc, setItemDesc] = useState('');

    // Package Details State
    const [quantity, setQuantity] = useState('1');
    const [weight, setWeight] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    // Scheduling State (Placeholder for now)
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    const [isQuoting, setIsQuoting] = useState(false);
    const [quotes, setQuotes] = useState<Quote[] | null>(null);

    const handleGetQuotes = async () => {
        if (!pickup || !dropoff || !itemDesc) return;
        if (isScheduled && (!scheduleDate || !scheduleTime)) return;

        setIsQuoting(true);
        setQuotes([]);

        const timeContext = isScheduled ? `${scheduleDate} ${scheduleTime}` : undefined;
        // Mocking delay for effect
        setTimeout(async () => {
            const result = await generateQuotes(pickup, dropoff, itemDesc, timeContext);
            setQuotes(result);
            setIsQuoting(false);
        }, 800);
    };

    const getDestinationName = () => {
        if (!dropoff) return "somewhere";
        return dropoff.split(',')[0];
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Heading */}
                <div className="mb-10 text-center md:text-left">
                    {quotes ? (
                        <>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Select Options</h2>
                            <p className="text-gray-500 font-medium mt-2">To {getDestinationName()}</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                Where are you <br />
                                sending it?
                            </h1>
                        </>
                    )}
                </div>

                {/* Input Form */}
                {!quotes && (
                    <div>
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                            {/* Pickup Row */}
                            <div className="relative flex items-center px-6 py-5 transition-colors hover:bg-gray-50/50">
                                <div className="w-8 flex justify-center flex-shrink-0 mr-4 text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <AddressAutocomplete
                                        value={pickup}
                                        onChange={setPickup}
                                        placeholder="Pickup location"
                                        variant="pickup"
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="ml-16 mr-6 h-px bg-gray-100"></div>

                            {/* Dropoff Row */}
                            <div className="relative flex items-center px-6 py-5 transition-colors hover:bg-gray-50/50">
                                <div className="w-8 flex justify-center flex-shrink-0 mr-4 text-gray-900">
                                    <MapPin className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <AddressAutocomplete
                                        value={dropoff}
                                        onChange={setDropoff}
                                        placeholder="Delivery destination"
                                        variant="dropoff"
                                        isLast
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="ml-16 mr-6 h-px bg-gray-100"></div>

                            {/* Item Row */}
                            <div className="relative flex items-center px-6 py-5 transition-colors hover:bg-gray-50/50">
                                <div className="w-8 flex justify-center flex-shrink-0 mr-4 text-gray-400">
                                    <Package className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    className="bg-transparent w-full outline-none text-lg font-medium placeholder-gray-300 text-gray-900"
                                    placeholder="What's in the box?"
                                    value={itemDesc}
                                    onChange={(e) => setItemDesc(e.target.value)}
                                />
                            </div>

                            {/* Divider */}
                            <div className="ml-16 mr-6 h-px bg-gray-100"></div>

                            {/* Weight & Qty Row */}
                            <div className="relative flex items-center px-6 py-5 transition-colors hover:bg-gray-50/50">
                                <div className="w-8 flex justify-center flex-shrink-0 mr-4 text-gray-400">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div className="flex gap-8 w-full">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                className="bg-transparent w-full outline-none text-lg font-medium placeholder-gray-300 text-gray-900"
                                                placeholder="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                            />
                                            <span className="text-xs font-bold text-gray-400 ml-2">Quantity</span>
                                        </div>
                                    </div>
                                    <div className="w-px bg-gray-100 mx-2"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                className="bg-transparent w-full outline-none text-lg font-medium placeholder-gray-300 text-gray-900 text-right pr-2"
                                                placeholder="0"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                            />
                                            <span className="text-xs font-bold text-gray-400 whitespace-nowrap">kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="ml-16 mr-6 h-px bg-gray-100"></div>

                            {/* Dimensions Row */}
                            <div className="relative flex items-center px-6 py-5 transition-colors hover:bg-gray-50/50">
                                <div className="w-8 flex justify-center flex-shrink-0 mr-4 text-gray-400">
                                    <Ruler className="w-5 h-5" />
                                </div>
                                <div className="flex gap-4 w-full">
                                    {['Length', 'Width', 'Height'].map((dim, i) => (
                                        <div key={dim} className="flex-1 flex items-center">
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                className="bg-transparent w-full outline-none text-lg font-medium placeholder-gray-300 text-gray-900"
                                                placeholder="0"
                                                value={i === 0 ? length : (i === 1 ? width : height)}
                                                onChange={(e) => i === 0 ? setLength(e.target.value) : (i === 1 ? setWidth(e.target.value) : setHeight(e.target.value))}
                                            />
                                            <span className="text-xs font-bold text-gray-400 ml-1">{dim}</span>
                                            {i < 2 && <span className="text-gray-300 ml-4">×</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGetQuotes}
                            disabled={!pickup || !dropoff || !itemDesc || !weight || isQuoting}
                            className={`w-full py-5 rounded-full font-bold text-lg flex items-center justify-center transition-all transform active:scale-[0.98] ${!pickup || !dropoff || !itemDesc || !weight
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5'
                                }`}
                        >
                            {isQuoting ? (
                                <span className="flex items-center">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></span>
                                    Calculating best rates...
                                </span>
                            ) : 'Find Courier'}
                        </button>
                    </div>
                )}

                {/* Quote Results List */}
                {(quotes || isQuoting) && (
                    <div className="animate-in slide-in-from-bottom-10 duration-500 pb-10">
                        <QuoteSelection
                            quotes={quotes || []}
                            isLoading={isQuoting}
                            onSelect={onBook}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
