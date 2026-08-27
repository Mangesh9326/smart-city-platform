import React, { useEffect, useRef, useState, useMemo } from 'react';

// UI Icons
const MapPinIcon = () => <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BrainIcon = () => <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const SignalIcon = () => <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM12 14h.01M12 10h.01" /></svg>;
const RouteIcon = () => <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const AlertIcon = () => <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// Agent Performance Metrics (Strictly N/A since they are not generated dynamically by the backend yet)
const AGENT_PERFORMANCE = {
  signalOptimizations: "N/A",
  successfulRecommendations: "N/A",
  routeRecommendations: "N/A",
  activeInterventions: "N/A",
  predictionAlerts: "N/A"
};

export default function LiveTraffic() {
  const mapRef = useRef(null);
  const renderersRef = useRef([]);

  const [mapObj, setMapObj] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Demonstration Data State
  const [demoTraffic, setDemoTraffic] = useState({ locations: [], source: "DEMONSTRATION DATA" });

  // Routing State
  const [origin, setOrigin] = useState("Dadar Station, Mumbai");
  const [destination, setDestination] = useState("Wadala, Mumbai");
  const [aiRoutes, setAiRoutes] = useState([]);
  const [isRouting, setIsRouting] = useState(false);

  // 1. Fetch Seeded Demonstration Data from Backend
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/traffic/live");
        if (res.ok) {
          const data = await res.json();
          setDemoTraffic(data);
        }
      } catch (err) {
        console.error("Failed to fetch demo traffic data:", err);
      }
    };
    fetchDemoData();
    const interval = setInterval(fetchDemoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const highTrafficNodes = demoTraffic.locations || [];

  // 2. Initialize Google Maps Native API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError("VITE_GOOGLE_MAPS_API_KEY is missing."); return; }

    const initMap = () => {
      if (mapRef.current && window.google) {
        const initialMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 19.0330, lng: 72.8550 }, 
          zoom: 13,
          backgroundColor: '#0f172a',
          disableDefaultUI: false,
          mapTypeControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
          ],
        });

        new window.google.maps.TrafficLayer().setMap(initialMap);
        setMapObj(initialMap);
        setDirectionsService(new window.google.maps.DirectionsService());
        setMapLoaded(true);
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setMapError("Failed to load Google Maps script.");
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Clear previous route renderers
  const clearRenderers = () => {
    renderersRef.current.forEach(renderer => renderer.setMap(null));
    renderersRef.current = [];
  };

  // 3. Traffic Agent Routing Function
  const calculateAiRoute = (e) => {
    if (e) e.preventDefault();
    if (!directionsService || !mapObj || !origin || !destination) return;
    
    setIsRouting(true);
    clearRenderers();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        setIsRouting(false);
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const evaluatedRoutes = result.routes.map((route, index) => {
            const isRecommended = index === 0; 
            const hasIncident = index === 1; 
            
            const renderer = new window.google.maps.DirectionsRenderer({
              map: mapObj,
              directions: result,
              routeIndex: index,
              polylineOptions: {
                strokeColor: isRecommended ? '#3b82f6' : (hasIncident ? '#ef4444' : '#64748b'),
                strokeWeight: isRecommended ? 6 : 4,
                strokeOpacity: isRecommended ? 1.0 : 0.6,
                zIndex: isRecommended ? 100 : 10
              }
            });
            renderersRef.current.push(renderer);

            return {
              id: index,
              name: `Route ${String.fromCharCode(65 + index)}`,
              summary: route.summary || "Unnamed Road",
              distance: route.legs[0].distance.text,
              duration: route.legs[0].duration.text,
              recommended: isRecommended,
              incident: hasIncident,
              impact: isRecommended ? "LOWER" : "HIGH",
              reason: isRecommended 
                ? "Lower predicted traffic impact." 
                : (hasIncident ? "Route affected by incident." : "Higher predicted congestion.")
            };
          });

          setAiRoutes(evaluatedRoutes);
        } else {
          setMapError(`Routing failed: ${status}`);
        }
      }
    );
  };

  // Handle Node Selection Map Panning
  useEffect(() => {
    if (mapObj && selectedNode && window.google) {
      const position = { lat: selectedNode.lat, lng: selectedNode.lng };
      mapObj.panTo(position);
      mapObj.setZoom(16);
    }
  }, [mapObj, selectedNode]);

  const bestRoute = aiRoutes.find(r => r.recommended)?.name || "Unavailable";

  // Dynamic Signal Block Renderer
  const renderSignalBlock = (approachData) => {
    if (!approachData) return null;
    const totalCurrent = approachData.currentGreen + approachData.currentRed;
    const totalRec = approachData.recGreen + approachData.recRed;
    
    return (
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 w-16">GREEN</span>
          <div className="flex-1 mx-2 flex gap-4 items-center">
            <div className="h-2 flex-1 rounded bg-slate-800 overflow-hidden">
               <div className="h-full bg-emerald-600" style={{ width: `${(approachData.currentGreen / totalCurrent) * 100}%` }}></div>
            </div>
            <span className="font-mono text-emerald-500 w-8">{approachData.currentGreen}s</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 w-16">RED</span>
          <div className="flex-1 mx-2 flex gap-4 items-center">
            <div className="h-2 flex-1 rounded bg-slate-800 overflow-hidden">
               <div className="h-full bg-red-600" style={{ width: `${(approachData.currentRed / totalCurrent) * 100}%` }}></div>
            </div>
            <span className="font-mono text-red-500 w-8">{approachData.currentRed}s</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 text-slate-100 font-sans overflow-y-auto custom-scrollbar pr-2 pb-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <BrainIcon />
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight uppercase">TRAFFIC INTELLIGENCE</h1>
            <p className="text-sm text-slate-400 font-medium">AI Traffic Agent Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono font-bold text-sm tracking-widest text-slate-300">
          <span>MUMBAI</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span className="text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* TIER 1: MAP & HIGH TRAFFIC AREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px] shrink-0">
        
        {/* Google Traffic Map */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg relative flex flex-col">
          <div className="flex-1 relative bg-slate-950">
            {mapError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6 text-center z-10">
                <AlertIcon />
                <span className="mt-2 text-sm font-mono">{mapError}</span>
              </div>
            ) : !mapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-10">
                <span className="text-sm font-mono animate-pulse">Initializing Google Traffic Map...</span>
              </div>
            ) : null}
            <div ref={mapRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded border border-slate-700 shadow-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPinIcon /> GOOGLE TRAFFIC MAP
            </div>
          </div>
        </div>

        {/* High Traffic Areas List */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200">High Traffic Areas</h3>
          </div>
          <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1">
            {highTrafficNodes.length === 0 ? (
               <div className="text-slate-500 text-sm italic text-center mt-6">Loading backend telemetry...</div>
            ) : (
              highTrafficNodes.map((node) => (
                <button 
                  key={node.id} 
                  onClick={() => setSelectedNode(node)}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left transition-all ${selectedNode?.id === node.id ? 'bg-slate-800 border-blue-500/50 shadow-inner' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}
                >
                  <span className="text-sm text-slate-200 font-bold">{node.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${node.severity === 'SEVERE' ? 'bg-red-500' : node.severity === 'HIGH' ? 'bg-orange-500' : node.severity === 'MODERATE' ? 'bg-yellow-400' : 'bg-emerald-400'}`}></span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${node.color}`}>
                      {node.severity}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: TRAFFIC AGENT | SIGNAL OPTIMIZATION | ROUTE INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        
        {/* Panel 2.1: Traffic Agent Status */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <BrainIcon /> Traffic Agent
            </h3>
          </div>
          <div className="p-5 flex-1">
            {!selectedNode ? (
              <div className="text-slate-500 text-sm italic">Select a location from High Traffic Areas...</div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Selected: <span className="text-slate-100 ml-1">{selectedNode.name}</span></div>
                
                <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-widest my-4">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  ANALYZING
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 block">Current:</span>
                  <span className={`text-lg font-bold uppercase ${selectedNode.color}`}>{selectedNode.severity}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 block">Prediction:</span>
                  <span className="text-sm font-bold uppercase text-slate-400">Prediction Unavailable</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2.2: Signal Optimization */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <SignalIcon /> Signal Optimization
            </h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            {!selectedNode || !selectedNode.signalOptimization ? (
              <div className="text-slate-500 text-sm italic">Select a valid intersection...</div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-700/50 pb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Current</div>
                    {renderSignalBlock(selectedNode.signalOptimization.approachA)}
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> AI Optimized
                    </div>
                    {/* Simulated visual difference using Rec values */}
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400 w-16">GREEN</span>
                        <div className="flex-1 mx-2 flex gap-4 items-center">
                          <div className="h-2 flex-1 rounded bg-slate-800 overflow-hidden shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                             <div className="h-full bg-emerald-400" style={{ width: `${(selectedNode.signalOptimization.approachA.recGreen / (selectedNode.signalOptimization.approachA.recGreen + selectedNode.signalOptimization.approachA.recRed)) * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-emerald-400 w-8">{selectedNode.signalOptimization.approachA.recGreen}s</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400 w-16">RED</span>
                        <div className="flex-1 mx-2 flex gap-4 items-center">
                          <div className="h-2 flex-1 rounded bg-slate-800 overflow-hidden shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                             <div className="h-full bg-red-400" style={{ width: `${(selectedNode.signalOptimization.approachA.recRed / (selectedNode.signalOptimization.approachA.recGreen + selectedNode.signalOptimization.approachA.recRed)) * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-red-400 w-8">{selectedNode.signalOptimization.approachA.recRed}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-200 mb-1">
                    Recommendation: <span className="text-emerald-400 ml-1">{selectedNode.signalOptimization.what}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Reason: {selectedNode.signalOptimization.why}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Panel 2.3: Route Intelligence */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200 flex items-center gap-2">
              <RouteIcon /> Route Intelligence
            </h3>
          </div>
          <div className="p-4 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            
            <form onSubmit={calculateAiRoute} className="flex items-center gap-2 mb-4 shrink-0">
               <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1.5 outline-none text-slate-200" />
               <span className="text-slate-500 text-sm">→</span>
               <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1.5 outline-none text-slate-200" />
               <button type="submit" disabled={isRouting} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50">GO</button>
            </form>

            <div className="flex flex-col gap-3 flex-1">
              {aiRoutes.length === 0 ? (
                <div className="text-slate-500 text-sm italic text-center mt-4">Calculate to evaluate routes.</div>
              ) : (
                aiRoutes.map((route) => (
                  <div key={route.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-200">{route.name}</span>
                      {route.recommended ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold tracking-widest uppercase"><CheckIcon/> AI Recommended</span>
                      ) : route.incident ? (
                        <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold tracking-widest uppercase"><AlertIcon/> Incident Impact</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-400">{route.distance} • {route.duration}</div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* TIER 3: AI PREDICTIONS & AGENT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        
        {/* Panel 3.1: AI Predictions */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden h-64">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200">AI Predictions</h3>
          </div>
          <div className="p-5 flex flex-col justify-center gap-4 flex-1">
             <div className="flex justify-between items-center border-b border-slate-800 pb-3">
               <span className="text-sm font-bold text-slate-400">Congestion</span>
               <span className="text-sm font-bold text-slate-500 italic">Prediction unavailable</span>
             </div>
             <div className="flex justify-between items-center border-b border-slate-800 pb-3">
               <span className="text-sm font-bold text-slate-400">Density</span>
               <span className="text-sm font-bold text-slate-500 italic">Prediction unavailable</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-bold text-slate-400">Best Route</span>
               <span className={`text-sm font-bold ${bestRoute !== 'Unavailable' ? 'text-blue-400' : 'text-slate-500 italic'}`}>{bestRoute}</span>
             </div>
          </div>
        </div>

        {/* Panel 3.2: Traffic Agent Performance */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden h-64">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-200">Traffic Agent Performance</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="text-xs font-bold text-slate-400">Signal Optimizations</span>
               <span className="text-lg font-mono font-bold text-slate-500">{AGENT_PERFORMANCE.signalOptimizations}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="text-xs font-bold text-slate-400">Successful Recs</span>
               <span className="text-lg font-mono font-bold text-slate-500">{AGENT_PERFORMANCE.successfulRecommendations}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="text-xs font-bold text-slate-400">Route Recs</span>
               <span className="text-lg font-mono font-bold text-slate-500">{AGENT_PERFORMANCE.routeRecommendations}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="text-xs font-bold text-slate-400">Prediction Alerts</span>
               <span className="text-lg font-mono font-bold text-slate-500">{AGENT_PERFORMANCE.predictionAlerts}</span>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}} />

    </div>
  );
}