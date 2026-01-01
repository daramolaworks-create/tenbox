import React, { useEffect, useState } from 'react';
import { TrackingEvent, Quote, ShipmentStatus } from '../types';
import { MessageSquare, Phone, ArrowLeft, ArrowRight, Navigation, MapPin, Crosshair, Box, Clock } from 'lucide-react';

interface TrackingViewProps {
  quote: Quote;
  onReset: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ quote, onReset }) => {
  const [status, setStatus] = useState<ShipmentStatus>(ShipmentStatus.BOOKED);
  const [events, setEvents] = useState<TrackingEvent[]>([
    {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Booking Confirmed',
      description: `Tenbox assigned ${quote.courierName} to your request.`
    }
  ]);

  useEffect(() => {
    // Simulate progression
    const timers = [
      setTimeout(() => {
        setStatus(ShipmentStatus.PICKING_UP);
        setEvents(prev => [{
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Rider Assigned',
          description: 'Rider is on the way to pickup location.',
          location: 'Downtown District'
        }, ...prev]);
      }, 5000),
      setTimeout(() => {
        setStatus(ShipmentStatus.IN_TRANSIT);
        setEvents(prev => [{
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Picked Up',
          description: 'Package collected. En route to destination.',
          location: 'Main Highway / Bridge'
        }, ...prev]);
      }, 15000),
      setTimeout(() => {
        setStatus(ShipmentStatus.DELIVERED);
        setEvents(prev => [{
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
          description: 'Package delivered successfully.',
          location: 'Destination Address'
        }, ...prev]);
      }, 25000)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-6rem)] md:min-h-0 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">

      {/* MAP SECTION (Technical HUD Style) */}
      <div className="h-[450px] bg-gray-900 relative w-full overflow-hidden group">

        {/* Map Background with Grid */}
        <div className="absolute inset-0 bg-[#0F1115]">
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}>
          </div>

          {/* Radar / Scan Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0F1115_90%)]"></div>

          {/* Pulse Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-24 border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute -inset-40 border border-dashed border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full animate-ping"></div>
              <div className="bg-blue-600 text-white p-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] z-10 relative">
                <Navigation className="h-6 w-6 transform -rotate-45 fill-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
          <button
            onClick={onReset}
            className="bg-black/40 backdrop-blur-md p-3 rounded-xl text-white hover:bg-black/60 transition-all border border-white/10 group-hover:border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex space-x-2">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-mono text-green-400">LIVE TRACKING</span>
            </div>
          </div>
        </div>

        {/* Floating Rider Stats Panel */}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-white font-mono font-bold">TK</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-bold text-lg">Tunde K.</h3>
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">PRO</span>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-gray-400 font-mono flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5"></span>
                    {quote.courierName}
                  </p>
                  <p className="text-xs text-gray-400 font-mono border-l border-white/10 pl-3">Toyota Camry</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="h-11 w-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/5">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="h-11 w-11 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-xl transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <Phone className="h-5 w-5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS PANEL */}
      <div className="flex-1 bg-white p-6 md:p-8">

        {/* Header Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-dashed border-gray-200">
          <div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1 block">Status</span>
            <div className="flex items-center space-x-2">
              {status === ShipmentStatus.DELIVERED
                ? <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                : <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              }
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {status === ShipmentStatus.DELIVERED ? 'ARRIVED' : 'IN TRANSIT'}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1 block">Est. Arrival</span>
            <div className="flex items-center justify-end space-x-2 text-gray-900">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xl font-mono font-bold tracking-tight">
                {quote.eta.replace('Today ', '')}
              </span>
            </div>
          </div>

          <div className="col-span-2 mt-2 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Box className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-600">ID: TNBX-8392-XJ</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-600">51.5074° N, 0.1278° W</span>
            </div>
          </div>
        </div>

        {/* Technical Timeline */}
        <div className="relative space-y-0">
          {events.map((evt, idx) => (
            <div key={idx} className="relative pl-8 pb-8 last:pb-0 group">
              {/* Connecting Line */}
              {idx !== events.length - 1 && (
                <div className="absolute left-[5px] top-2 bottom-0 w-px bg-gray-200 group-last:hidden"></div>
              )}

              {/* Node */}
              <div className={`absolute left-0 top-1.5 h-[11px] w-[11px] border-[2px] z-10 transition-all duration-300 ${idx === 0
                ? 'bg-black border-black shadow-[0_0_0_4px_rgba(0,0,0,0.1)]'
                : 'bg-white border-gray-300'
                }`}></div>

              <div className={`transition-all duration-500 ${idx === 0 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-base font-bold text-gray-900">{evt.status}</h4>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{evt.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed max-w-md">{evt.description}</p>

                {evt.location && (
                  <div className="mt-3 inline-flex items-center text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 border border-blue-100 rounded">
                    <MapPin className="h-3 w-3 mr-1.5" />
                    {evt.location.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {status === ShipmentStatus.DELIVERED && (
          <div className="mt-10 animate-in slide-in-from-bottom-2">
            <button
              onClick={onReset}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-xl active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>COMPLETE ORDER</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};