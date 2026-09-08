import React, { useState, useEffect, useRef } from 'react';
import { calculateModernRoutes } from '../../../services/googleRoutesService';

export default function RouteIntelligence() {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [origin, setOrigin] = useState("Dadar Station, Mumbai");
  const [destination, setDestination] = useState("Wadala, Mumbai");
  const [scenario, setScenario] = useState("");
  const [routes, setRoutes] = useState([]);
  const [agentDecision, setAgentDecision] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Map
  useEffect(() => {
    const initMap = async () => {
      const { Map, TrafficLayer } = await window.google.maps.importLibrary("maps");
      const initialMap = new Map(mapRef.current, {
        center: { lat: 19.0178, lng: 72.8478 },
        zoom: 14,
        backgroundColor: '#0f172a',
        styles: [{ elementType: "geometry", stylers: [{ color: "#1e293b" }] }]
      });
      new TrafficLayer().setMap(initialMap);
      setMapObj(initialMap);
    };
    if (window.google) initMap();
  }, []);

  const handleRouteEvaluation = async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    try {
      // Utilize the modern Google Maps Routes API to avoid DirectionsService
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const calculatedRoutes = await calculateModernRoutes(origin, destination, apiKey);
      
      // Request AI Route Evaluation
      const response = await fetch("http://localhost:5000/api/traffic/routes/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, routes: calculatedRoutes, scenario })
      });
      
      const data = await response.json();
      setRoutes(calculatedRoutes);
      setAgentDecision(data.decision?.metadata || generateDemoDecision(scenario));
    } catch (error) {
      console.error("Routing failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDemoDecision = (selectedScenario) => ({
    incident: "Accident detected on Dadar–Wadala corridor",
    impact: "Severe congestion within 15 min",
    prediction: { current: "Moderate", plus15: "High", plus30: "Severe", confidence: "91%" },
    signal: { currentGreen: 42, currentRed: 48, recGreen: 55, recRed: 35, adjustment: "+13 sec green" },
    recommendedRouteId: 1,
    reason: "Accident detected. AI predicts increasing congestion, alternate corridor recommended.",
    outcome: "4 min estimated improvement"
  });

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase">Route Intelligence</h1>
          <p className="text-sm text-slate-400">AI-powered route planning and decision intelligence</p>
        </div>
        <select value={scenario} onChange={(e) => setScenario(e.target.value)} className="bg-slate-900 border border-slate-700 rounded p-2 text-sm">
          <option value="">SELECT DEMONSTRATION SCENARIO</option>
          <option value="dadar_peak">Dadar Peak Congestion</option>
          <option value="ambulance_priority">Ambulance Green Corridor</option>
          <option value="wadala_closure">Wadala Road Closure</option>
        </select>
      </div>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between">
        <div className="flex items-center gap-4 w-full">
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-slate-800 p-2 rounded w-1/3" />
          <span>→</span>
          <input value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-slate-800 p-2 rounded w-1/3" />
          <button onClick={handleRouteEvaluation} className="bg-blue-600 px-4 py-2 rounded font-bold">
            {isProcessing ? "PROCESSING..." : "CALCULATE ROUTE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-slate-900 rounded-xl border border-slate-700 h-[400px] relative">
          <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-xl" />
          <div className="absolute top-4 left-4 bg-slate-950/80 px-2 py-1 text-xs border border-slate-700 rounded">SIMULATED TRAFFIC STATE</div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          {routes.slice(0,2).map((route, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${idx === agentDecision?.recommendedRouteId ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-900 border-slate-700'}`}>
              <h3 className="font-bold">{idx === agentDecision?.recommendedRouteId ? 'AI RECOMMENDED ROUTE' : 'CURRENT ROUTE'}</h3>
              <p className="text-sm text-slate-400">{route.summary}</p>
              <div className="mt-2 text-xs font-mono">{idx === agentDecision?.recommendedRouteId ? 'STATUS: RECOMMENDED' : 'STATUS: AFFECTED'}</div>
            </div>
          ))}
        </div>
      </div>

      {agentDecision && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <h3 className="font-bold text-orange-400">ROUTE IMPACT</h3>
            <p className="text-sm mt-2">{agentDecision.incident}</p>
            <p className="text-xs text-slate-400 mt-1">Predicted: {agentDecision.impact}</p>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded mt-2 block w-max">DEMONSTRATION SCENARIO</span>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <h3 className="font-bold text-indigo-400">TRAFFIC PREDICTION</h3>
            <ul className="text-sm mt-2 space-y-1">
              <li>Now: {agentDecision.prediction.current}</li>
              <li>+15 MIN: {agentDecision.prediction.plus15}</li>
              <li>+30 MIN: {agentDecision.prediction.plus30}</li>
            </ul>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded mt-2 block w-max">DEMONSTRATION AI PREDICTION</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <h3 className="font-bold text-emerald-400">SIGNAL OPTIMIZATION</h3>
            <div className="text-sm mt-2">
              <p>Current: {agentDecision.signal.currentGreen}s Green | {agentDecision.signal.currentRed}s Red</p>
              <p className="text-emerald-400 font-bold mt-1">AI: {agentDecision.signal.recGreen}s Green | {agentDecision.signal.recRed}s Red</p>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded mt-2 block w-max">SIMULATED SIGNAL OPTIMIZATION</span>
          </div>
        </div>
      )}
      
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center font-mono text-sm text-slate-300">
        INCIDENT → PREDICTION → ROUTE IMPACT → ROUTES EVALUATED → SIGNAL ANALYSIS → BEST ROUTE
      </div>
    </div>
  );
}