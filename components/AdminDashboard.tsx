import React from 'react';
import { AlertTriangle, Check, RefreshCw, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Mock active issues
  const issues = [
    { id: 'TNBX-8821', type: 'Delay Risk', courier: 'Kwik', status: 'Traffic Delay', time: '10m ago' },
    { id: 'TNBX-8824', type: 'No Rider', courier: 'Gokada', status: 'Searching...', time: '2m ago' },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-apple">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center tracking-tight">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Ops Center
        </h2>
        <span className="text-[11px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500 uppercase tracking-wide">Live</span>
      </div>

      <div className="space-y-3">
        {issues.map(issue => (
            <div key={issue.id} className="p-4 rounded-2xl bg-[#FFF5F5] border border-red-100 flex items-center justify-between group cursor-pointer hover:bg-red-50 transition-colors">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-red-600 bg-white px-1.5 py-0.5 rounded border border-red-100">{issue.id}</span>
                        <span className="text-[13px] font-bold text-red-700">{issue.type}</span>
                    </div>
                    <p className="text-[15px] text-gray-900 font-medium">{issue.courier} • {issue.status}</p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white shadow-sm rounded-full text-gray-700 hover:text-black">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-white shadow-sm rounded-full text-red-600 hover:text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                    </button>
                </div>
            </div>
        ))}

        {issues.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-medium">All systems operational.</p>
            </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Rider Pool Status</h3>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {[1,2,3,4].map(i => (
                <div key={i} className="flex-shrink-0 flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 min-w-[140px]">
                    <div className="relative">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-900">Rider {i}</span>
                        <span className="text-[11px] text-gray-500 font-medium">Idle</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};