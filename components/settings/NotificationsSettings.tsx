import React, { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';

export const NotificationsSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [marketing, setMarketing] = useState(false);

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
        <SettingsLayout title="Notifications" onBack={onBack}>
            <div className="divide-y divide-gray-100">
                <Toggle
                    label="Email Notifications"
                    desc="Receive order updates and receipts"
                    checked={emailNotifs}
                    onChange={setEmailNotifs}
                />
                <Toggle
                    label="Push Notifications"
                    desc="Get alerts on your device"
                    checked={pushNotifs}
                    onChange={setPushNotifs}
                />
                <Toggle
                    label="Marketing"
                    desc="Receive offers and promotions"
                    checked={marketing}
                    onChange={setMarketing}
                />
            </div>
        </SettingsLayout>
    );
};
