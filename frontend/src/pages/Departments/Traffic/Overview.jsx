import React from 'react';
import KPICard from '../../../components/KPICard';
import DataTable from '../../../components/DataTable';
import { useTrafficStore } from '../../../store/useTrafficStore';

export default function TrafficOverview() {
  // Pulling state directly from the isolated Zustand store
  const { activeVehicles, congestionLevel, incidents } = useTrafficStore();

  // Mock data for initial visual structure
  const recentIncidents = [
    { id: 'TRF-091', type: 'Collision', location: 'MG Road Junction', status: 'Active' },
    { id: 'TRF-092', type: 'Signal Failure', location: 'Station Road', status: 'Resolved' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <header>
        <h1 className="text-2xl font-bold text-gray-100">Traffic Operations Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time vehicle telemetry and road conditions</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Active Vehicles" value={activeVehicles || "12,450"} status="neutral" />
        <KPICard title="Congestion Level" value={congestionLevel || "High"} status="warning" />
        <KPICard title="Active Incidents" value={incidents.length || "2"} status="critical" />
        <KPICard title="Signal Efficiency" value="94%" status="nominal" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-6 flex-grow">
        {/* Map Placeholder */}
        <div className="col-span-2 glass-panel flex items-center justify-center border-dashed border-2 border-city-700/50">
          <span className="text-gray-500 font-mono">[ Interactive Map Widget Placeholder ]</span>
        </div>
        
        {/* Data Table Area */}
        <div className="col-span-1 flex flex-col gap-4">
          <h3 className="font-bold text-gray-300 uppercase text-sm tracking-wider">Recent Incidents</h3>
          <DataTable 
            headers={['ID', 'Type', 'Location', 'Status']}
            data={recentIncidents}
          />
        </div>
      </div>
    </div>
  );
}