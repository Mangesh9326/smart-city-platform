import React from 'react';
import DataTable from '../../../components/DataTable';

export default function TrafficSignals() {
  const signalData = [
    { id: 'SIG-101', intersection: 'MG Road & 5th Ave', status: 'Automated', phase: 'Green-East', cycleTime: '90s' },
    { id: 'SIG-102', intersection: 'Station Rd & Main', status: 'AI Override', phase: 'Red-All', cycleTime: '120s' },
    { id: 'SIG-103', intersection: 'River Bridge Entry', status: 'Manual', phase: 'Flashing Yellow', cycleTime: 'N/A' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <header>
        <h1 className="text-2xl font-bold text-gray-100">Traffic Signal Control</h1>
        <p className="text-sm text-gray-400 mt-1">Manage intersection phasing and emergency overrides</p>
      </header>

      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-indigo-500">
        <div>
          <h3 className="font-bold text-gray-200">AI Adaptive Timing Status</h3>
          <p className="text-sm text-gray-400">The Decision Engine is currently optimizing routes based on the active collision.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded shadow-lg transition-colors text-sm font-medium">
          Force Manual Override
        </button>
      </div>

      <div className="flex-grow">
        <h3 className="font-bold text-gray-300 uppercase text-sm tracking-wider mb-4">Signal Grid Network</h3>
        <DataTable 
          headers={['Signal ID', 'Intersection', 'Operating Mode', 'Current Phase', 'Cycle Time']}
          data={signalData}
        />
      </div>
    </div>
  );
}