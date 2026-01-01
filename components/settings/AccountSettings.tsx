import React, { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';

export const AccountSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [name, setName] = useState('Dan Wilson');
    const [email, setEmail] = useState('dan@example.com');
    const [phone, setPhone] = useState('+44 7700 900000');

    return (
        <SettingsLayout title="Account Settings" onBack={onBack}>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="pt-4">
                    <button className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                        Save changes
                    </button>
                </div>
            </div>
        </SettingsLayout>
    );
};
