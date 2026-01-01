import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { searchAddress } from '../services/gemini';

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  variant: 'pickup' | 'dropoff';
  isLast?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange, placeholder, variant, isLast }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    onChange(query);
    if (query.length > 4) {
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (e) {
        // Silent fail
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="block w-full pl-0 pr-4 bg-transparent border-none focus:ring-0 text-gray-900 font-medium placeholder-gray-400 text-lg leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-[-2.5rem] right-[-1rem] bg-white/90 backdrop-blur-xl shadow-apple rounded-2xl py-2 mt-2 border border-gray-100/50 overflow-hidden">
          <ul className="max-h-60 overflow-auto no-scrollbar">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="text-gray-900 cursor-pointer relative py-3 px-5 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-none flex items-center"
                onClick={() => {
                  onChange(suggestion);
                  setIsOpen(false);
                }}
              >
                <div className="bg-gray-200 p-1.5 rounded-full mr-3 text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="block truncate font-medium text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};