import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SettingsLayoutProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ title, onBack, children }) => {
    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <button
                onClick={onBack}
                className="flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                {children}
            </div>
        </div>
    );
};
