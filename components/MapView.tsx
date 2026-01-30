
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Address } from '../types';

interface MapViewProps {
  pickups: Address[];
  deliveries: Address[];
  currentLocation?: { lat: number; lng: number };
}

export const MapView: React.FC<MapViewProps> = ({ pickups, deliveries, currentLocation }) => {
  return (
    <div className="relative w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
      
      {/* Fake UI Overlay for map interaction */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50"><Navigation size={18} /></button>
      </div>

      <div className="relative flex flex-col items-center gap-4 text-center p-6">
        <div className="flex -space-x-2">
          {pickups.map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-blue-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white">
              <MapPin size={16} />
            </div>
          ))}
          {deliveries.map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-red-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white">
              <MapPin size={16} />
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Visualização da Rota Ativa<br/>
          <span className="text-xs opacity-60">Integração com Google Maps API</span>
        </p>
      </div>
    </div>
  );
};
