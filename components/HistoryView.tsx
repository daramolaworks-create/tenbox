import React from 'react';
import { HistoryItem, ShipmentStatus } from '../types';
import { Package, ChevronRight } from 'lucide-react';

export const HistoryView: React.FC = () => {
  // Mock History Data
  const history: HistoryItem[] = [
    {
      id: 'TBX-9928',
      date: 'Today, 10:23 AM',
      pickup: '10 Downing St, London',
      dropoff: 'Canary Wharf',
      status: ShipmentStatus.DELIVERED,
      price: 45.00,
      item: 'Documents'
    },
    {
      id: 'TBX-8821',
      date: 'Yesterday, 4:15 PM',
      pickup: '5th Avenue, New York',
      dropoff: 'Brooklyn Heights',
      status: ShipmentStatus.DELIVERED,
      price: 28.50,
      item: 'Small Box'
    },
    {
      id: 'TBX-7732',
      date: 'Oct 24, 2:00 PM',
      pickup: 'Shibuya, Tokyo',
      dropoff: 'Shinjuku',
      status: ShipmentStatus.CANCELLED,
      price: 0,
      item: 'Electronics'
    }
  ];

  const getStatusColor = (status: ShipmentStatus) => {
    switch(status) {
        case ShipmentStatus.DELIVERED: return 'text-green-600';
        case ShipmentStatus.CANCELLED: return 'text-red-500';
        default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {history.map((item, idx) => (
        <React.Fragment key={item.id}>
          <div className="relative group hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center p-4">
                <div className="bg-gray-100 p-3 rounded-full mr-4 text-gray-600 shrink-0">
                    <Package className="h-6 w-6 stroke-[1.5px]" />
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-[17px] text-gray-900 truncate">{item.dropoff}</h4>
                        <span className={`text-[15px] ${getStatusColor(item.status)} font-medium`}>
                          {item.status === ShipmentStatus.DELIVERED ? 'Delivered' : item.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[15px] text-gray-500 truncate">{item.date} • {item.item}</p>
                        <p className="text-[15px] text-gray-900 font-medium">${item.price.toFixed(0)}</p>
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
            </div>
          </div>
          {/* Inset Divider (not for last item) */}
          {idx < history.length - 1 && (
              <div className="ml-[4.5rem] h-[1px] bg-gray-100"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};