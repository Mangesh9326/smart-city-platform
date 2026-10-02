import React, { useState, useEffect, useRef } from 'react';

const mumbaiLocations = [
  { id: 'CAM-101', name: 'Ruia College Road', road: 'Matunga West', lat: 19.023845829174906, lng: 72.8496884047973 },
  { id: 'CAM-102', name: 'Dadar Railway Station', road: 'Dr. Ambedkar Rd', lat: 19.0180, lng: 72.8436 },
  { id: 'CAM-103', name: 'Wadala Highway (Eastern Freeway Junction)', road: 'Eastern Freeway', lat: 19.0218, lng: 72.8745 }
];

const processingStages = [
  'Queued', 'Loading Scenario', 'Initializing Replay', 
  'Processing Incident', 'Generating Timeline', 'Creating Incident', 
  'Activating Response', 'Completed'
];

export default function SimulateDemonstation() {
  const isMounted = useRef(true);

  // --- SECTION 1: TRAFFIC / INCIDENT SIMULATION STATE ---
  const [selectedCamera, setSelectedCamera] = useState(mumbaiLocations[0]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [scenarioDetails, setScenarioDetails] = useState(null);
  
  const [trafficProcessing, setTrafficProcessing] = useState(false);
  const [trafficStageIndex, setTrafficStageIndex] = useState(0);
  const [trafficProgress, setTrafficProgress] = useState(0);
  const [createdIncidentId, setCreatedIncidentId] = useState(null);
  const [trafficError, setTrafficError] = useState(null);

  // --- SECTION 2: HOSPITAL SIMULATION STATE ---
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [hospitalProcessing, setHospitalProcessing] = useState(false);
  const [hospitalSuccess, setHospitalSuccess] = useState(false);
  const [hospitalError, setHospitalError] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ------------------------------------------------------------------
  // TRAFFIC / INCIDENT SIMULATION LOGIC
  // ------------------------------------------------------------------
  useEffect(() => {
    fetch('/api/simulation/scenario')
      .then(res => res.json())
      .then(data => {
        if (!isMounted.current) return;
        const formatted = Array.isArray(data) ? data : (data.scenarios || []);
        const validScenarios = formatted.filter(s => s.id !== 'live'); 
        setScenarios(validScenarios);
      })
      .catch(err => console.error("Failed to fetch scenarios:", err));
  }, []);

  useEffect(() => {
    if (!selectedScenarioId) {
      setScenarioDetails(null);
      return;
    }
    fetch(`/api/simulation/scenario/${selectedScenarioId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted.current) setScenarioDetails(data.scenario || data);
      })
      .catch(err => console.error("Failed to fetch scenario details:", err));
  }, [selectedScenarioId]);

  const handleStartTrafficSimulation = async () => {
    if (!selectedScenarioId || !selectedCamera || trafficProcessing) return;
    
    setTrafficProcessing(true);
    setTrafficError(null);
    setCreatedIncidentId(null);
    setTrafficStageIndex(1); // 'Loading Scenario'
    setTrafficProgress(20);

    // Snapshot existing incidents so we can identify the newly created one
    const prevIncidentIds = new Set(activeIncidents.map(i => String(i.incident_id)));

    try {
      const res = await fetch('/api/simulation/start-inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: selectedCamera.id,
          locationName: selectedCamera.name,
          scenarioId: selectedScenarioId
        })
      });
      
      if (!res.ok) {
        let errorMessage = "SIMULATION START FAILED";
        try {
          const errData = await res.json();
          errorMessage = errData.error || errData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      setTrafficStageIndex(3); // 'Processing Incident'
      setTrafficProgress(50);
      
      // Start Polling for the new incident created by the Replay Engine
      pollForCreatedIncident(selectedCamera.name, prevIncidentIds, 1, 10);
      
    } catch (err) {
      setTrafficError(err.message || "BACKEND CONNECTION ERROR: Unable to contact the simulation server.");
      setTrafficProcessing(false);
    }
  };

  const pollForCreatedIncident = async (locationName, prevIncidentIds, attempt, maxAttempts) => {
    if (!isMounted.current) return;

    if (attempt > maxAttempts) {
      setTrafficError("SIMULATION STARTED — INCIDENT PENDING: The replay engine started successfully, but an active incident has not yet been returned by the incident API.");
      setTrafficProcessing(false);
      return;
    }

    try {
      // Simulate progressing UI stages while waiting
      setTrafficStageIndex(Math.min(3 + attempt, processingStages.length - 2));
      setTrafficProgress(Math.min(50 + (attempt * 5), 90));

      const res = await fetch('/api/hospitals/incidents');
      if (res.ok) {
        const incidents = await res.json();
        const validIncidents = Array.isArray(incidents) ? incidents : [];
        
        // Find newly spawned incident matching this location
        const newlyCreated = validIncidents.find(i => 
          i.location === locationName && !prevIncidentIds.has(String(i.incident_id))
        ) || validIncidents.find(i => i.location === locationName); // fallback to newest at location

        if (newlyCreated && !prevIncidentIds.has(String(newlyCreated.incident_id))) {
          // Success
          setCreatedIncidentId(newlyCreated.incident_id);
          setTrafficStageIndex(processingStages.length - 1); // 'Completed'
          setTrafficProgress(100);
          setTrafficProcessing(false);
          setActiveIncidents(validIncidents);
          
          // Auto-select the newly created incident in the Hospital Section
          setSelectedIncidentId(prev => prev ? prev : newlyCreated.incident_id);
          return;
        }
      }
    } catch (err) {
      console.warn("Incident poll failed", err);
    }

    setTimeout(() => {
      pollForCreatedIncident(locationName, prevIncidentIds, attempt + 1, maxAttempts);
    }, 1000);
  };

  // ------------------------------------------------------------------
  // HOSPITAL EMERGENCY SIMULATION LOGIC
  // ------------------------------------------------------------------
  const fetchActiveIncidents = async () => {
    try {
      const res = await fetch('/api/hospitals/incidents');
      if (res.ok) {
        const data = await res.json();
        if (isMounted.current) setActiveIncidents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch active incidents:", err);
    }
  };

  useEffect(() => {
    fetchActiveIncidents();
    const interval = setInterval(fetchActiveIncidents, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected incident state if it gets resolved/deleted natively
  useEffect(() => {
    if (selectedIncidentId && !activeIncidents.find(i => String(i.incident_id) === String(selectedIncidentId))) {
      setSelectedIncidentId('');
      setHospitalSuccess(false);
    }
  }, [activeIncidents, selectedIncidentId]);

  const handleStartHospitalSimulation = async () => {
    if (!selectedIncidentId || hospitalProcessing) return;
    
    setHospitalProcessing(true);
    setHospitalError(null);
    setHospitalSuccess(false);

    try {
      const activeInc = activeIncidents.find(i => String(i.incident_id) === String(selectedIncidentId));
      const res = await fetch('/api/hospitals/agent/evaluate-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          incident_id: selectedIncidentId,
          incident_type: activeInc?.incident_type,
          location: activeInc?.location,
          severity: activeInc?.severity,
          destination_hospital: activeInc?.receiving_hospital_name || activeInc?.receiving_hospital_id
        })
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to initiate hospital response.";
        try {
          const errData = await res.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      
      setHospitalSuccess(true);
    } catch (err) {
      setHospitalError(err.message || "BACKEND CONNECTION ERROR");
    } finally {
      setHospitalProcessing(false);
    }
  };

  const selectedActiveIncident = activeIncidents.find(i => String(i.incident_id) === String(selectedIncidentId));

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-200 font-sans">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-8 sm:pb-12 flex flex-col gap-6 sm:gap-8">
        
        {/* HEADER */}
        <header className="border-b border-slate-800 pb-4 sm:pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                  Control Device: Mobile
                </span>
                <span className="bg-blue-900/20 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Demonstration Mode
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mt-2">Operations Control Center</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Simulation Launchpad</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          
          {/* =========================================================
              SECTION 1: TRAFFIC / INCIDENT SIMULATION
          ========================================================= */}
          <section className="bg-slate-900 border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 sm:p-5">
              <div className="text-[10px] font-bold text-blue-400 tracking-widest uppercase mb-1">Step 1</div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wide">Traffic / Incident Simulation</h2>
              <p className="text-xs text-slate-400 mt-1">Select an operational location and scenario to simulate city incident response.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Target Module: <span className="text-slate-300">Traffic Operations / Incident Response</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-6 flex-1">
              
              {/* Location Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">1. Operational Location / Camera</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mumbaiLocations.map(cam => (
                    <button
                      key={cam.id}
                      onClick={() => setSelectedCamera(cam)}
                      className={`min-h-[80px] p-3 rounded-lg border text-left transition-all ${selectedCamera.id === cam.id ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="text-xs font-mono font-bold text-slate-300 mb-1">{cam.id}</div>
                      <div className="text-xs font-bold text-slate-100 truncate">{cam.name}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-2">Active</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">2. Database Scenario Feed</label>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  disabled={trafficProcessing}
                  className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <option value="">-- Select Emergency Scenario --</option>
                  {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Incident Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[140px]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">Incident Preview</div>
                {scenarioDetails ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div><span className="text-slate-500 block">Type:</span> <span className="font-bold text-slate-200">{scenarioDetails.incident_type || scenarioDetails.type || "N/A"}</span></div>
                    <div><span className="text-slate-500 block">Severity:</span> <span className="font-bold text-slate-200">{scenarioDetails.severity || "N/A"}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-500 block">Location:</span> <span className="font-mono text-slate-300">{selectedCamera.name}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-500 block">Scenario:</span> <span className="text-slate-300">{scenarioDetails.name}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-500 block">Source:</span> <span className="font-mono text-emerald-400">DATABASE SCENARIO</span></div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Select a scenario to view preview details.</p>
                )}
              </div>

              {/* Traffic Start Action */}
              <div className="mt-auto pt-2 flex flex-col gap-3">
                {trafficError && <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded border border-red-900/50">{trafficError}</div>}
                
                {trafficProcessing && (
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest">Simulation Running</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate pl-2">{processingStages[trafficStageIndex]}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${trafficProgress}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-400 italic">Replay engine started. Waiting for incident event...</div>
                  </div>
                )}

                {createdIncidentId && !trafficProcessing && (
                  <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Simulation Active
                    </div>
                    <div className="text-xs text-slate-300">Incident Created: <span className="font-mono font-bold text-white break-all">{createdIncidentId}</span></div>
                    <div className="text-[10px] text-slate-400 italic">This incident is now active on desktop operations modules.</div>
                  </div>
                )}

                <button
                  onClick={handleStartTrafficSimulation}
                  disabled={!selectedScenarioId || trafficProcessing}
                  className="w-full min-h-[52px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs sm:text-sm uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {trafficProcessing ? "PROCESSING..." : "START TRAFFIC SIMULATION"}
                </button>
              </div>
            </div>
          </section>

          {/* =========================================================
              SECTION 2: HOSPITAL EMERGENCY SIMULATION
          ========================================================= */}
          <section className="bg-slate-900 border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <div className="text-[10px] font-bold text-teal-400 tracking-widest uppercase mb-1">Step 2</div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-wide">Hospital Emergency Simulation</h2>
                  <p className="text-xs text-slate-400 mt-1">Select an active incident and simulate coordinated hospital and ambulance response.</p>
                </div>
                <button onClick={fetchActiveIncidents} className="w-full sm:w-auto shrink-0 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 px-3 py-2 sm:py-1.5 rounded border border-slate-600 text-[10px] font-bold tracking-widest uppercase transition-colors">
                  Refresh Incidents
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Target Module: <span className="text-slate-300">Hospital Emergency & Ambulance Operations</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-6 flex-1">
              
              {/* Active Incident Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">1. Active Database Incidents</label>
                {activeIncidents.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 text-center">
                    <div className="text-xs font-bold text-slate-400 mb-1">NO ACTIVE INCIDENTS</div>
                    <div className="text-[10px] text-slate-500">Start an incident simulation in the Traffic / Incident Simulation section above to create an active incident.</div>
                  </div>
                ) : (
                  <select
                    value={selectedIncidentId}
                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                    disabled={hospitalProcessing}
                    className="w-full min-h-[48px] bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-500 font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <option value="">-- Select Active Incident --</option>
                    {activeIncidents.map(inc => (
                      <option key={inc.incident_id} value={inc.incident_id}>
                        {inc.severity || "UNKNOWN"} — {inc.incident_type || "INCIDENT"} — {inc.location || "Unknown Location"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Incident Details */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[140px]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">Active Incident</div>
                {selectedActiveIncident ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div className="sm:col-span-2"><span className="text-slate-500 block">Incident ID:</span> <span className="font-mono font-bold text-slate-200 break-all">{selectedActiveIncident.incident_id}</span></div>
                    <div><span className="text-slate-500 block">Severity:</span> <span className="font-bold text-slate-200">{selectedActiveIncident.severity || "N/A"}</span></div>
                    <div><span className="text-slate-500 block">Type:</span> <span className="font-bold text-slate-300">{selectedActiveIncident.incident_type || "N/A"}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-500 block">Location:</span> <span className="font-mono text-slate-300">{selectedActiveIncident.location || "N/A"}</span></div>
                    
                    <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      <div><span className="text-[9px] uppercase text-slate-500 block">Patients</span><span className="font-mono font-bold text-slate-300">{selectedActiveIncident.patient_count ?? "N/A"}</span></div>
                      <div><span className="text-[9px] uppercase text-slate-500 block">Critical</span><span className="font-mono font-bold text-red-400">{selectedActiveIncident.critical_patient_count ?? "N/A"}</span></div>
                      <div><span className="text-[9px] uppercase text-slate-500 block">Serious</span><span className="font-mono font-bold text-orange-400">{selectedActiveIncident.serious_patient_count ?? "N/A"}</span></div>
                      <div><span className="text-[9px] uppercase text-slate-500 block">Amb Req.</span><span className="font-mono font-bold text-slate-300">{selectedActiveIncident.ambulances_required ?? "N/A"}</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Select an active incident to view details.</p>
                )}
              </div>

              {/* Hospital Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">Hospital Response Preview</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div className="mb-1 text-slate-500">Ambulance Response</div>
                    <div className="text-slate-200">STANDBY / READY</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div className="mb-1 text-slate-500">Receiving Hospital</div>
                    <div className="text-slate-200 truncate">{selectedActiveIncident?.receiving_hospital_id || selectedActiveIncident?.receiving_hospital_name || "AWAITING ASSIGNMENT"}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div className="mb-1 text-slate-500">Hospital Agent</div>
                    <div className="text-teal-400">ASSESSMENT AVAILABLE</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div className="mb-1 text-slate-500">Traffic Coordination</div>
                    <div className="text-teal-400">READY</div>
                  </div>
                </div>
              </div>

              {/* Hospital Start Action */}
              <div className="mt-auto pt-2 flex flex-col gap-3">
                {hospitalError && <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded border border-red-900/50">{hospitalError}</div>}
                
                {hospitalSuccess && (
                  <div className="bg-teal-950/20 border border-teal-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="text-[10px] sm:text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> Hospital Simulation Active
                    </div>
                    <div className="text-xs text-slate-300">Incident: <span className="font-mono font-bold text-white break-all">{selectedIncidentId}</span></div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      <span className="block mb-1">• Hospital Agent: ASSESSMENT ACTIVE</span>
                      <span className="block">• Emergency Operations: READY</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic mt-2 border-t border-teal-900/50 pt-2">Simulated response is now active on desktop operations screens.</div>
                  </div>
                )}

                <button
                  onClick={handleStartHospitalSimulation}
                  disabled={!selectedIncidentId || hospitalProcessing}
                  className="w-full min-h-[52px] bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg text-xs sm:text-sm uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {hospitalProcessing ? "INITIATING..." : "START HOSPITAL SIMULATION"}
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}