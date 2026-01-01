import React, { useState } from 'react';
import { Quote, ServiceLevel } from '../types';

interface QuoteSelectionProps {
  quotes: Quote[];
  onSelect: (quote: Quote) => void;
  isLoading: boolean;
}

export const QuoteSelection: React.FC<QuoteSelectionProps> = ({ quotes, onSelect, isLoading }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const getLabel = (level: ServiceLevel) => {
    switch (level) {
      case ServiceLevel.RUSH: return "Priority";
      case ServiceLevel.STANDARD: return "Standard";
      case ServiceLevel.SAVER: return "Saver";
    }
  };

  const getSubLabel = (level: ServiceLevel) => {
    switch (level) {
      case ServiceLevel.RUSH: return "Fastest (Bike)";
      case ServiceLevel.STANDARD: return "Reliable (Car)";
      case ServiceLevel.SAVER: return "Best Value (Van)";
    }
  };

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const isSelected = selectedId === quote.id;

        return (
          <div
            key={quote.id}
            onClick={() => setSelectedId(quote.id)}
            className={`relative flex items-center p-4 cursor-pointer transition-all duration-200 bg-white rounded-2xl border-2 ${isSelected
                ? 'border-black shadow-apple-hover scale-[1.01]'
                : 'border-transparent shadow-apple hover:scale-[1.01]'
              }`}
          >
            {/* Vehicle/Service Icon Placeholder */}
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-50 text-gray-500'}`}>
              <span className="text-lg font-bold">{quote.serviceLevel[0]}</span>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-[17px] leading-tight">{getLabel(quote.serviceLevel)}</h4>
              <p className="text-sm text-gray-500">{getSubLabel(quote.serviceLevel)}</p>
            </div>

            {/* Price & ETA */}
            <div className="text-right">
              <p className="font-bold text-gray-900 text-[17px]">${quote.price.toFixed(0)}</p>
              <p className="text-xs text-gray-400 font-medium">{quote.eta}</p>
            </div>
          </div>
        );
      })}

      {/* Confirm Button for Selection */}
      {selectedId && (
        <div className="pt-4 sticky bottom-0 bg-white/50 backdrop-blur-sm pb-2">
          <button
            onClick={() => onSelect(quotes.find(q => q.id === selectedId)!)}
            className="w-full bg-black text-white font-bold text-lg py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
};