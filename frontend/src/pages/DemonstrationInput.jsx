import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DemonstrationInput() {
  const navigate = useNavigate();
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    locationName: '',
    road: '',
    videoFile: 'synthetic_demo_01.mp4', // Default to your newly created synthetic data
  });

  const cameras = [
    { id: 'CAM-101', name: 'MG Road Junction', road: 'Mahatma Gandhi Rd', lat: 18.922, lng: 72.834 },
    { id: 'CAM-102', name: 'Station Road Entry', road: 'Station Rd', lat: 18.925, lng: 72.836 },
    { id: 'CAM-103', name: 'River Bridge North', road: 'River Rd', lat: 18.930, lng: 72.840 }
  ];

  const handleCameraSelect = (cam) => {
    setSelectedCamera(cam);
    setFormData({
      ...formData,
      locationName: cam.name,
      road: cam.road
    });
  };

  const handleStartInference = async (e) => {
    e.preventDefault();
    if (!selectedCamera) return;

    setIsProcessing(true);
    setIsComplete(false);
    simulateYOLOProcessing();

    // Actual Backend Call
    try {
      const response = await fetch('http://localhost:5000/api/simulation/start-inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cameraId: selectedCamera.id, 
          locationName: formData.locationName, 
          videoFile: formData.videoFile 
        })
      });

      if (response.ok) {
        setTimeout(() => {
          setIsProcessing(false);
          setIsComplete(true);
        }, 6000); 
      } else {
        console.error("[ERROR] Backend simulation start failed.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("[ERROR] Could not connect to backend server:", err);
      setIsProcessing(false);
    }
  };

  const simulateYOLOProcessing = () => {
    setLogs([]);
    setProgress(0);
    const fakeLogs = [
      "Initializing YOLOv8-CityOS weights...",
      "Allocating VRAM (1.2GB) on GTX 1060...",
      `Loading video stream: ${formData.videoFile}...`,
      "[Frame 001] Detected: CAR (0.98), BUS (0.94), PERSON (0.88)",
      "[Frame 045] Detected: CAR (0.95), CAR (0.91) - Tracking IDs assigned.",
      "[Frame 120] ANOMALY DETECTED: Rapid Deceleration / Collision Signature",
      "Mapping spatial coordinates to dynamic location...",
      "Caching event timeline into PostgreSQL database...",
      "Pushing event sequence to Multi-Agent Coordinator EventBus...",
      "Inference complete. Replay Engine and Agent Pipeline active."
    ];

    fakeLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        setProgress(((index + 1) / fakeLogs.length) * 100);
      }, index * 600);
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-city-900 text-gray-100 p-6 gap-6 overflow-hidden">
      
      {/* Left Column: Configuration Form */}
      <div className={`w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 transition-opacity duration-500 ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <header className="border-b border-city-700/50 pb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
            Simulation Launchpad
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Configure geographic nodes and inject media to test the Multi-Agent AI pipeline.
          </p>
        </header>

        {/* Step 1: Map & Node Selection */}
        <div className="glass-panel p-5 flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step 1: Select Spatial Node</span>
             <span className="text-[10px] bg-city-800 px-2 py-1 rounded text-gray-400 border border-city-700">EPSG:4326</span>
           </div>
           
           {/* Future Leaflet Map Container */}
           <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border border-city-700 flex items-center justify-center shadow-inner">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
             <span className="z-10 text-gray-600 font-mono text-sm tracking-widest">[ REACT LEAFLET MOUNT POINT ]</span>
             
             {/* Mock Map Nodes */}
             <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
             <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-gray-600 rounded-full"></div>
             <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-gray-600 rounded-full"></div>
           </div>

           <div className="grid grid-cols-3 gap-3 mt-2">
             {cameras.map(cam => (
               <button
                 key={cam.id}
                 type="button"
                 onClick={() => handleCameraSelect(cam)}
                 className={`p-3 rounded-xl border text-left transition-all duration-200 ${selectedCamera?.id === cam.id ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-city-800/50 border-city-700/50 text-gray-400 hover:bg-city-700 hover:border-city-600'}`}
               >
                 <div className="font-bold text-sm">{cam.id}</div>
                 <div className="text-xs opacity-70 truncate mt-1">{cam.name}</div>
               </button>
             ))}
           </div>
        </div>

        {/* Step 2: Media Injection Form */}
        <form onSubmit={handleStartInference} className="glass-panel p-5 flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Step 2: Inject Telemetry / Media</span>
          
          <div className="grid grid-cols-2 gap-5">
             <div className="flex flex-col gap-1.5">
               <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Target Location Override</label>
               <input readOnly value={formData.locationName} className="w-full bg-black/40 border border-city-700/80 rounded-lg p-2.5 text-sm text-blue-300 font-mono shadow-inner outline-none" placeholder="Select node above..." />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Road Identity</label>
               <input readOnly value={formData.road} className="w-full bg-black/40 border border-city-700/80 rounded-lg p-2.5 text-sm text-blue-300 font-mono shadow-inner outline-none" placeholder="Select node above..." />
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">CCTV Footage Source</label>
             <select 
               value={formData.videoFile} 
               onChange={(e) => setFormData({...formData, videoFile: e.target.value})}
               className="w-full bg-black/40 border border-city-700/80 rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:border-teal-500 transition-colors"
             >
               <option value="synthetic_demo_01.mp4">synthetic_demo_01.mp4 (Heavy Rain & Collision)</option>
               <option value="mg_road_accident_01.mp4">mg_road_accident_01.mp4 (Standard Collision)</option>
             </select>
          </div>

          {/* Future Video Preview Container */}
          <div className="w-full h-32 bg-black rounded-lg border border-city-700 flex items-center justify-center text-gray-600 text-xs font-mono relative overflow-hidden">
             <span className="z-10">[ VIDEO PLAYER MOUNT POINT ]</span>
             <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-[10px] text-red-500 tracking-widest font-bold">OFFLINE Media</span>
             </div>
          </div>

          <button 
             type="submit" 
             disabled={!selectedCamera || isProcessing || isComplete}
             className="mt-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 disabled:from-city-800 disabled:to-city-800 disabled:text-gray-500 text-white font-bold py-3.5 rounded-lg shadow-lg transition-all text-sm uppercase tracking-widest"
          >
             {isProcessing ? 'Executing Pipeline...' : 'Run YOLO & Cache Timeline'}
          </button>
        </form>
      </div>

      {/* Right Column: Processing Terminal */}
      <div className="w-1/2 flex flex-col gap-4">
        
        <div className="glass-panel flex-grow flex flex-col overflow-hidden border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
          <div className="bg-black/60 p-4 border-b border-city-700/50 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
               </div>
               <span className="text-sm font-bold uppercase tracking-widest text-indigo-300 ml-2">Pipeline Console</span>
             </div>
             <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">GTX 1060 VRAM: 1.2GB</span>
          </div>
          
          <div className="flex-grow bg-[#0A0A0A] p-5 font-mono text-[13px] overflow-y-auto space-y-3 leading-relaxed">
             {!isProcessing && !isComplete ? (
               <div className="text-gray-500 italic">user@cityos:~$ Awaiting media injection command...</div>
             ) : (
               logs.map((log, i) => (
                 <div key={i} className={`flex items-start gap-3 ${log.includes('ANOMALY') ? 'text-red-400 font-bold bg-red-500/5 py-1 px-2 rounded -ml-2' : 'text-gray-300'}`}>
                   <span className="text-indigo-500/70 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,-1)}]</span>
                   <span>{log}</span>
                 </div>
               ))
             )}
             {isProcessing && (
               <div className="flex items-start gap-3 text-gray-500">
                 <span className="text-indigo-500/70 shrink-0">[{new Date().toISOString().split('T')[1].slice(0,-1)}]</span>
                 <span className="animate-pulse">_</span>
               </div>
             )}
          </div>

          {isProcessing && (
            <div className="p-5 bg-city-900 border-t border-city-700/50">
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                <span>Inference & Caching Progress</span>
                <span className="text-indigo-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-black rounded-full h-1.5 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Success Action Card */}
        {isComplete && (
          <div className="glass-panel border-emerald-500/30 p-5 bg-gradient-to-br from-emerald-900/20 to-city-900 flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Processing Cached!
              </div>
              <div className="text-xs text-gray-400 font-mono">Replay Engine broadcasting tick data via WebSockets.</div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              Enter Unified Dashboard →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}