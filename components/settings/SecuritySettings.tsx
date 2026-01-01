import React from 'react';
import { SettingsLayout } from './SettingsLayout';
import { Shield, Smartphone, Key } from 'lucide-react';

export const SecuritySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <SettingsLayout title="Security" onBack={onBack}>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-200 shadow-sm">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Password</p>
                            <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                        </div>
                    </div>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Update</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-200 shadow-sm">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">2-Step Verification</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                    </div>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Enable</button>
                </div>
            </div>
        </SettingsLayout>
    );
};
