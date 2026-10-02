import React, { useState, useEffect, useMemo } from 'react';

// Reusable Patient Flow Stage Component
const FlowStage = ({ label, status, active }) => {
  const colorClass = active ? (status === 'CRITICAL' ? 'bg-red-500' : status === 'HIGH' ? 'bg-orange-400' : 'bg-blue-500') : 'bg-slate-700';
  return (
    <div className="flex flex-col items-center gap-2 flex-1 relative">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${colorClass}`}>
        {active && <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
        {label}
      </span>
      <div className="absolute top-4 left-1/2 w-full h-1 bg-slate-800 -z-0"></div>
    </div>
  );
};

export default function EmergencyDepartment() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch('/api/hospitals/emergency');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setHospitals(data);
      } catch (err) {
        console.error('[HOSPITAL UI] Failed to load emergency data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
    const interval = setInterval(fetchEmergencyData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    let cap = 0, occ = 0, queue = 0, waitSum = 0, waitCount = 0;
    hospitals.forEach(h => {
      cap += h.emergency_capacity || 0;
      occ += h.emergency_occupancy || 0;
      queue += h.ambulance_queue || 0;
      if (h.average_wait_minutes) {
        waitSum += h.average_wait_minutes;
        waitCount++;
      }
    });
    return {
      capacity: cap,
      occupancy: occ,
      queue,
      avgWait: waitCount > 0 ? Math.round(waitSum / waitCount) : 0,
      pressure: cap > 0 ? ((occ / cap) * 100).toFixed(1) : 0
    };
  }, [hospitals]);

  // Ranked Hospitals by Pressure
  const rankedHospitals = useMemo(() => {
    return [...hospitals].sort((a, b) => {
      const pressureA = a.emergency_capacity ? a.emergency_occupancy / a.emergency_capacity : 0;
      const pressureB = b.emergency_capacity ? b.emergency_occupancy / b.emergency_capacity : 0;
      return pressureB - pressureA; // Descending
    });
  }, [hospitals]);

  const networkStatus = kpis.pressure > 90 ? 'CRITICAL' : kpis.pressure > 75 ? 'HIGH' : 'NORMAL';

  if (loading) return <div className="flex h-full items-center justify-center font-mono text-slate-400 animate-pulse">Monitoring Emergency Bays...</div>;
  if (error) return <div className="p-6 text-red-400 font-bold uppercase tracking-widest text-sm">Error connecting to Hospital Emergency API</div>;

  return (
    <div className="flex flex-col gap-6 h-full p-6 text-slate-200 bg-slate-950 overflow-y-auto font-sans">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white">Emergency Department</h1>
          <p className="text-sm text-slate-400 mt-1">Live Trauma, Triage & Ambulance Routing Pressure</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span className="px-3 py-1.5 bg-blue-900/30 border border-blue-500 text-blue-400 rounded flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span> HOSPITAL AGENT ACTIVE
          </span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center shadow">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Incoming (Queue)</span>
          <span className="text-2xl font-mono font-bold mt-2 text-orange-400">{kpis.queue}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center shadow">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Under Treatment</span>
          <span className="text-2xl font-mono font-bold mt-2 text-blue-400">{kpis.occupancy}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center shadow">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Treatment Rooms</span>
          <span className="text-2xl font-mono font-bold mt-2 text-slate-200">{kpis.capacity}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center shadow">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Average Wait</span>
          <span className="text-2xl font-mono font-bold mt-2 text-yellow-400">{kpis.avgWait} <span className="text-sm text-slate-500">min</span></span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center shadow">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">ER Occupancy</span>
          <span className={`text-2xl font-mono font-bold mt-2 ${kpis.pressure > 90 ? 'text-red-400' : 'text-emerald-400'}`}>{kpis.pressure}%</span>
        </div>
      </div>

      {/* Patient Flow Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shrink-0 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Standard Patient Flow Pipeline</h2>
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-500">ACTIVE METRIC MAP</span>
        </div>
        <div className="flex justify-between items-start w-full overflow-hidden pt-2">
          <FlowStage label="Arrival" active={true} status={networkStatus} />
          <FlowStage label="Registration" active={true} status={networkStatus} />
          <FlowStage label="Triage" active={true} status={networkStatus} />
          <FlowStage label="Waiting" active={kpis.avgWait > 0} status={networkStatus} />
          <FlowStage label="Treatment" active={kpis.occupancy > 0} status={networkStatus} />
          <FlowStage label="Observation" active={false} status="NORMAL" />
          <FlowStage label="Admission / Discharge" active={false} status="NORMAL" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        {/* Left: Ranked Emergency Table */}
        <div className="xl:col-span-8 bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200">Hospitals Ranked By ER Pressure</h3>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
              <thead className="bg-slate-950/80 text-[10px] uppercase tracking-widest text-slate-500 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">ER Level</th>
                  <th className="px-4 py-3">Queue</th>
                  <th className="px-4 py-3">Wait (Avg)</th>
                  <th className="px-4 py-3 w-[150px]">Occupancy</th>
                  <th className="px-4 py-3">Pressure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rankedHospitals.map(h => {
                  const pressure = h.emergency_capacity ? (h.emergency_occupancy / h.emergency_capacity) * 100 : 0;
                  const isCritical = h.emergency_level === 'CRITICAL' || pressure > 90;
                  return (
                    <tr key={h.name} className="hover:bg-slate-800/50 transition-colors">
                      <td className={`px-4 py-3 font-bold text-slate-200 border-l-2 ${isCritical ? 'border-red-500' : 'border-transparent'}`}>{h.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${isCritical ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                          {h.emergency_level || 'STANDBY'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-mono ${h.ambulance_queue > 0 ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>{h.ambulance_queue}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{h.average_wait_minutes}m</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 w-full mt-1">
                          <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                            <div className={`transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pressure, 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[10px] font-mono text-slate-400">{h.emergency_occupancy} / {h.emergency_capacity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Hospital Agent Intelligence */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-blue-500/20 pb-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Hospital Agent Assessment
            </span>
            <div className="text-sm text-slate-200 font-medium leading-relaxed">
              {kpis.queue > 0 
                ? `Active emergency queue detected (${kpis.queue} inbound units). Cross-domain coordination with Traffic Agent recommended for route clearance.` 
                : 'Emergency reception stable. No acute diversion protocols required at this time.'}
            </div>
            
            <div className="bg-slate-950/50 p-3 rounded border border-slate-800 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Current Trend</span>
                <span className={`font-mono font-bold ${networkStatus === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}`}>{networkStatus}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Predicted Horizon</span>
                <span className="font-mono text-blue-400">+15 Minutes</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">Agent Confidence</span>
                <span className="font-mono text-emerald-400">92.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}