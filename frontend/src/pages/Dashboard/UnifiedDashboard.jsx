import React from 'react';
import DigitalTwinMap from '../../components/DigitalTwin/MapWidget';

// --- MOCK COMPONENTS (To be replaced by Zustand Store Data) ---

// const DigitalTwinMap = () => (
//   <div className="flex h-full w-full items-center justify-center relative bg-gray-900 border-t border-city-700/50">
//     <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
//     <span className="z-10 text-gray-500 font-mono tracking-widest text-sm">[ REACT LEAFLET DIGITAL TWIN MOUNT ]</span>
//     {/* Incident Marker Mock */}
//     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
//       <div className="w-6 h-6 bg-red-500/20 border-2 border-red-500 rounded-full animate-ping absolute"></div>
//       <div className="w-4 h-4 bg-red-500 rounded-full z-10 shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
//       <span className="mt-2 text-xs font-bold text-red-400 bg-black/80 px-2 py-1 rounded border border-red-500/30">MG Road Collision</span>
//     </div>
//   </div>
// );

// --- ISOLATED DEPARTMENT PANELS ---

const TrafficPanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-red-400 font-bold border-b border-red-500/20 pb-1">
      <span>Incident: Road Blocked</span>
      <span className="text-xs bg-red-500/10 px-2 py-0.5 rounded">Critical</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Expected Congestion:</span>
      <span className="font-mono text-yellow-400">42%</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Diversion Routes:</span>
      <span className="text-xs">Ring Rd, Station Rd</span>
    </div>
  </div>
);

const HospitalPanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
      <span>Incident: Casualties (2)</span>
      <span className="text-xs bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Ambulances Dispatched:</span>
      <span className="font-mono text-blue-400">2</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Available ICU Beds:</span>
      <span className="font-mono text-emerald-400">5</span>
    </div>
  </div>
);

const PolicePanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-blue-400 font-bold border-b border-blue-500/20 pb-1">
      <span>Incident: Securing Area</span>
      <span className="text-xs bg-blue-500/10 px-2 py-0.5 rounded">Coordinating</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Officers Deployed:</span>
      <span className="font-mono">4</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Intersection Status:</span>
      <span className="text-red-400 text-xs uppercase tracking-wider">Closed</span>
    </div>
  </div>
);

const FirePanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-orange-400 font-bold border-b border-orange-500/20 pb-1">
      <span>Incident: Hazard Check</span>
      <span className="text-xs bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Standby</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Fire/Fuel Risk:</span>
      <span className="font-mono text-emerald-400">LOW</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Trucks Deployed:</span>
      <span className="font-mono">0</span>
    </div>
  </div>
);

const UtilityPanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-purple-400 font-bold border-b border-purple-500/20 pb-1">
      <span>Incident: Grid Scan</span>
      <span className="text-xs bg-purple-500/10 px-2 py-0.5 rounded">Nominal</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Power Stations:</span>
      <span className="font-mono text-emerald-400">Stable</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Streetlights/Water:</span>
      <span className="font-mono">Nominal</span>
    </div>
  </div>
);

const CitizenPanel = () => (
  <div className="p-3 text-sm flex flex-col gap-2">
    <div className="flex justify-between items-center text-teal-400 font-bold border-b border-teal-500/20 pb-1">
      <span>Incident: Weather & Public</span>
      <span className="text-xs bg-teal-500/10 px-2 py-0.5 rounded animate-pulse">Alerting</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Environment:</span>
      <span className="text-xs">Heavy Rain (120mm)</span>
    </div>
    <div className="flex justify-between text-gray-300">
      <span className="text-gray-500">Broadcast Issued:</span>
      <span className="text-xs text-red-400">"Avoid MG Road"</span>
    </div>
  </div>
);


const DecisionCommander = () => (
  <div className="p-4 flex flex-col gap-3 h-full">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
      <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Global Priority: Critical</span>
    </div>
    
    <div className="bg-black/40 border border-city-700/50 rounded-lg p-4">
      <div className="text-sm font-bold text-gray-200 mb-1">Target: MG Road Collision</div>
      <div className="text-xs text-gray-500 mb-4">Multi-Agent Unified Action Plan Executing:</div>
      
      <ul className="space-y-3 text-sm text-gray-300">
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <span>Dispatch 2 Ambulances <span className="text-[10px] text-gray-500 block">(Hospital Agent)</span></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <span>Close MG Road Intersection <span className="text-[10px] text-gray-500 block">(Police Agent)</span></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <span>Initiate Traffic Diversion <span className="text-[10px] text-gray-500 block">(Traffic Agent)</span></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <span>Activate Green Corridor <span className="text-[10px] text-gray-500 block">(Traffic + Police)</span></span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-0.5 animate-pulse">⟳</span>
          <span>Issue Mobile Citizen Alert <span className="text-[10px] text-gray-500 block">(Citizen Agent)</span></span>
        </li>
      </ul>
    </div>
  </div>
);

const LLMAssistant = () => (
  <div className="p-4 flex flex-col h-full gap-3">
    <div className="flex-grow overflow-y-auto space-y-3">
      {/* User prompt */}
      <div className="flex justify-end">
        <div className="bg-city-700/50 text-gray-200 text-sm px-3 py-2 rounded-lg rounded-tr-none max-w-[85%]">
          What happened?
        </div>
      </div>
      {/* LLM Response */}
      <div className="flex justify-start">
        <div className="bg-blue-900/20 border border-blue-500/30 text-blue-100 text-sm px-3 py-2 rounded-lg rounded-tl-none max-w-[95%] leading-relaxed">
          <span className="font-bold text-blue-400 text-xs block mb-1">Grok AI System:</span>
          A major traffic collision involving a truck and a passenger vehicle occurred at MG Road Junction during heavy rainfall. Traffic congestion is expected to increase by approximately 42%. Two ambulances have been dispatched from City Hospital, police have initiated road closure and diversion, and citizens have been advised to avoid the affected area.
        </div>
      </div>
    </div>
    
    {/* Input Box Mock */}
    <div className="mt-4 relative">
      <input 
        type="text" 
        placeholder="Ask Grok for insights or report generation..." 
        className="w-full bg-black/50 border border-city-700/80 rounded-lg py-2.5 pl-3 pr-10 text-sm text-gray-300 outline-none focus:border-blue-500 transition-colors"
        disabled
      />
      <button className="absolute right-2 top-2 text-blue-500 hover:text-blue-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
      </button>
    </div>
  </div>
);

// --- MAIN LAYOUT COMPONENT ---

export default function UnifiedDashboard() {
  return (
    // Removed fixed height and overflow-hidden to allow natural scrolling
    <div className="min-h-screen bg-city-900 p-6 flex flex-col gap-6 text-gray-100 font-sans">
      
      {/* Top Navigation & Global KPIs */}
      <header className="glass-panel p-5 flex justify-between items-center shrink-0 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            Unified Command Center
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1.5">
            <span className="text-emerald-400 font-bold mr-2">● LIVE</span> 
            Engine Tick: 00:65 | Scenario: Synthetic Demo (MG Road)
          </p>
        </div>
        <div className="flex space-x-4 text-sm font-medium">
          <div className="bg-red-500/10 text-red-400 px-5 py-2.5 rounded-lg border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Critical Alert: MG Road
          </div>
          <div className="bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-lg border border-blue-500/30">
            Agents Active: 6
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Spans 8 cols) */}
        <section className="col-span-8 flex flex-col gap-6">
          
          {/* Smaller, Fixed-Height 2D Digital Twin Map */}
          <div className="glass-panel h-80 relative overflow-hidden flex flex-col border-city-700/80 shadow-lg shrink-0">
            <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-black/80 rounded text-[10px] text-gray-300 font-mono border border-city-700 flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              DIGITAL TWIN SYNC
            </div>
            <DigitalTwinMap />
          </div>

          {/* Department Data Grid - Expanded to show all 6 departments */}
          <div className="grid grid-cols-3 gap-4">
            
            <div className="glass-panel flex flex-col border-t-2 border-t-red-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Traffic Dept</span>
                <span className="text-red-400">Alert</span>
              </div>
              <TrafficPanel />
            </div>

            <div className="glass-panel flex flex-col border-t-2 border-t-emerald-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Hospital Dept</span>
                <span className="text-emerald-400">Deploying</span>
              </div>
              <HospitalPanel />
            </div>

            <div className="glass-panel flex flex-col border-t-2 border-t-blue-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Police Dept</span>
                <span className="text-blue-400">Coordinating</span>
              </div>
              <PolicePanel />
            </div>

            <div className="glass-panel flex flex-col border-t-2 border-t-orange-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Fire Dept</span>
                <span className="text-orange-400">Standby</span>
              </div>
              <FirePanel />
            </div>

            <div className="glass-panel flex flex-col border-t-2 border-t-purple-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Utility Dept</span>
                <span className="text-purple-400">Nominal</span>
              </div>
              <UtilityPanel />
            </div>

            <div className="glass-panel flex flex-col border-t-2 border-t-teal-500/70 hover:bg-city-800/80 transition-colors shadow-md">
              <div className="border-b border-city-700/50 p-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex justify-between items-center">
                <span>Citizen Services</span>
                <span className="text-teal-400 animate-pulse">Alerting</span>
              </div>
              <CitizenPanel />
            </div>

          </div>

        </section>

        {/* Right Column: AI Intelligence (Spans 4 cols) */}
        <section className="col-span-4 flex flex-col gap-6">
          
          {/* Decision Intelligence Panel */}
          <div className="glass-panel flex flex-col border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)] overflow-hidden h-[450px]">
             <div className="border-b border-indigo-500/20 p-3.5 text-xs font-bold text-indigo-300 uppercase tracking-widest bg-indigo-900/10 rounded-t-xl flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Decision Intelligence
                </span>
                <span className="text-[9px] bg-indigo-500/20 px-2 py-1 rounded text-indigo-200 border border-indigo-500/30">MULTI-AGENT FUSION</span>
             </div>
             <div className="flex-grow overflow-y-auto">
               <DecisionCommander />
             </div>
          </div>

          {/* LLM City Assistant Chat */}
          <div className="glass-panel flex flex-col overflow-hidden h-[380px]">
            <div className="border-b border-city-700/50 p-3.5 text-xs font-bold text-gray-300 uppercase tracking-widest bg-city-800/30 rounded-t-xl flex items-center justify-between">
                <span>City Assistant</span>
                <span className="text-[9px] bg-blue-500/20 px-2 py-1 rounded text-blue-300 border border-blue-500/30">GROK NLP</span>
             </div>
             <div className="flex-grow overflow-y-auto">
               <LLMAssistant />
             </div>
          </div>

        </section>
      </main>
    </div>
  );
}