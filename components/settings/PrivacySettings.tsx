import React, { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';

export const PrivacySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [dataSharing, setDataSharing] = useState(true);
    const [adPersonalization, setAdPersonalization] = useState(true);

    const Toggle = ({ label, desc, checked, onChange }: any) => (
        <div className="flex items-center justify-between py-4">
            <div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <SettingsLayout title="Privacy" onBack={onBack}>
            <div className="divide-y divide-gray-100">
                <Toggle
                    label="Data Sharing"
                    desc="Share usage data to help us improve"
                    checked={dataSharing}
                    onChange={setDataSharing}
                />
                <Toggle
                    label="Ad Personalization"
                    desc="See ads that are relevant to you"
                    checked={adPersonalization}
                    onChange={setAdPersonalization}
                />

                <div className="pt-6 mt-6 border-t border-gray-100">
                    <button className="text-red-600 font-bold text-sm hover:text-red-700">
                        Delete Account
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        Permanently delete your account and all associated data.
                    </p>
                </div>
            </div>
        </SettingsLayout>
    );
};
