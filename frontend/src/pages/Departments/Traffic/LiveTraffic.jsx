import React from 'react';
import KPICard from '../../../components/KPICard';
import { useTrafficStore } from '../../../store/useTrafficStore';

export default function LiveTraffic() {
  const { activeVehicles, congestionLevel } = useTrafficStore();

  return (
    <div className="flex flex-col gap-6 h-full">
      <header>
        <h1 className="text-2xl font-bold text-gray-100">Live Traffic Telemetry</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time intersection monitoring and vehicle tracking</p>
      </header>

      {/* Real-time KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Vehicles Tracking" value={activeVehicles || "14,205"} status="neutral" />
        <KPICard title="Current Congestion" value={congestionLevel || "Moderate"} status="warning" />
        <KPICard title="Avg Speed (City)" value="32 km/h" status="nominal" />
        <KPICard title="Active Diversions" value="2" status="critical" />
      </div>

      {/* Main Telemetry View */}
      <div className="flex-grow grid grid-cols-3 gap-6">
        {/* Full Height Map Placeholder */}
        <div className="col-span-2 glass-panel flex flex-col overflow-hidden">
          <div className="bg-city-800/80 border-b border-city-700/50 p-3 flex justify-between items-center">
             <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Live Map View</span>
             <span className="flex items-center gap-2 text-xs text-red-400 font-mono">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
             </span>
          </div>
          <div className="flex-grow flex items-center justify-center text-city-700 font-mono">
            [ React Leaflet Map Injection Point ]
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="col-span-1 glass-panel flex flex-col">
          <div className="bg-city-800/80 border-b border-city-700/50 p-3">
             <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Telemetry Feed</span>
          </div>
          <div className="flex-grow p-4 overflow-y-auto space-y-3">
             <div className="text-sm border-l-2 border-red-500 pl-3 py-1 bg-city-800/30">
               <div className="text-gray-400 text-xs">10:30:15 AM</div>
               <div className="text-gray-200">Sudden deceleration detected: MG Road</div>
             </div>
             <div className="text-sm border-l-2 border-orange-500 pl-3 py-1 bg-city-800/30">
               <div className="text-gray-400 text-xs">10:29:40 AM</div>
               <div className="text-gray-200">Volume threshold exceeded: Station Road</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}