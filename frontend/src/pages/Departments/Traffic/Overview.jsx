import React, { useState, useMemo, useEffect } from 'react';
import TrafficCameraMap from '../../../components/DigitalTwin/TrafficCameraMap';
import { useMapStore } from '../../../store/useMapStore';

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const CameraIcon = () => (
  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const MapIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
);

// Accurate GPS Coordinates for Mumbai Hotspots
const MUMBAI_GEO_TAGS = [
  { name: "Dadar Junction", lat: 19.0178, lng: 72.8478 },
  { name: "Bandra West", lat: 19.0596, lng: 72.8295 },
  { name: "Bandra Kurla Complex", lat: 19.0660, lng: 72.8658 },
  { name: "Andheri East", lat: 19.1136, lng: 72.8697 },
  { name: "Sion Circle", lat: 19.0390, lng: 72.8619 },
  { name: "Wadala Highway", lat: 19.0216, lng: 72.8634 },
  { name: "Powai Lake Road", lat: 19.1176, lng: 72.9060 },
  { name: "Kurla West", lat: 19.0728, lng: 72.8797 },
  { name: "Worli Sea Face", lat: 19.0169, lng: 72.8166 },
  { name: "Lower Parel", lat: 18.9940, lng: 72.8300 },
  { name: "Marine Drive", lat: 18.9433, lng: 72.8228 },
  { name: "Ghatkopar East", lat: 19.0856, lng: 72.9082 },
  { name: "Vile Parle", lat: 19.0968, lng: 72.8434 },
  { name: "Santa Cruz", lat: 19.0838, lng: 72.8380 },
  { name: "CSMT / Fort", lat: 18.9398, lng: 72.8354 }
];

const DIRECTIONS = ["Northbound", "Southbound", "Eastbound", "Westbound", "Intersection"];

// Helper function to find the true closest location based on map coordinates
const getNearestLocation = (lat, lng) => {
  let nearest = MUMBAI_GEO_TAGS[0];
  let minDist = Infinity;
  MUMBAI_GEO_TAGS.forEach(loc => {
    const dist = Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  });
  return nearest.name;
};

export default function TrafficCameras() {
  const { entities, initializeMap } = useMapStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [externalFeeds, setExternalFeeds] = useState([]);
  
  // Toggles for UI and Feed types
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'grid'
  const [feedSource, setFeedSource] = useState('loop'); // 'api' | 'loop'

  useEffect(() => {
    if (!entities || entities.length === 0) {
      fetch("/api/map/data")
        .then((res) => res.json())
        .then((data) => initializeMap(data))
        .catch((err) => console.error("Failed to fetch map data", err));
    }
  }, [entities, initializeMap]);

  useEffect(() => {
    const fetchLiveFeeds = async () => {
      if (feedSource !== 'api') return;
      try {
        const res = await fetch('https://api.data.gov.sg/v1/transport/traffic-images');
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
          setExternalFeeds(data.items[0].cameras);
        }
      } catch (e) {
        console.error("Failed to fetch external CCTV API", e);
      }
    };
    fetchLiveFeeds();
    const interval = setInterval(fetchLiveFeeds, 60000);
    return () => clearInterval(interval);
  }, [feedSource]);

  // Format DB CCTV entities
  const cameras = useMemo(() => {
    if (!entities) return [];
    
    return entities
      .filter(e => e.entity_type === 'cctv')
      .map((e, index) => {
        const lat = parseFloat(e.latitude);
        const lng = parseFloat(e.longitude);
        
        // Use true spatial mapping
        const locationName = getNearestLocation(lat, lng);
        const direction = DIRECTIONS[index % DIRECTIONS.length];
        
        // Force ~15% of cameras to be offline for realism
        const isOffline = index % 7 === 0;
        const status = isOffline ? 'Offline' : 'Online';
        
        let liveFeedUrl = null;
        let isVideo = false;
        let streamType = 'N/A';

        if (!isOffline) {
            if (feedSource === 'loop') {
                const vidIndex = (index % 7) + 1; // Maps to 1.mp4 through 7.mp4
                liveFeedUrl = `http://localhost:5000/videos/${vidIndex}.mp4`;
                isVideo = true;
                streamType = 'Live Video Stream (MP4)';
            } else {
                liveFeedUrl = externalFeeds.length > 0 ? externalFeeds[index % externalFeeds.length]?.image : null;
                isVideo = false;
                streamType = 'API Snapshot';
            }
        }

        return {
          camera_id: e.entity_id,
          camera_code: e.name || `CAM-MUM-${String(index + 1).padStart(3, '0')}`,
          name: `${locationName} Traffic Node`,
          location_name: locationName,
          latitude: lat,
          longitude: lng,
          road_name: locationName,
          direction: direction,
          status: status,
          source: feedSource === 'loop' ? 'Local Edge Storage' : 'External Open API',
          stream_type: streamType,
          stream_url: liveFeedUrl,
          isVideo: isVideo
        };
      });
  }, [entities, externalFeeds, feedSource]);

  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter(c => c.status === 'Online').length;
  const offlineCameras = cameras.filter(c => c.status === 'Offline').length;

  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      const matchesSearch = cam.camera_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cam.location_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = areaFilter === 'All' || cam.location_name === areaFilter;
      const matchesStatus = statusFilter === 'All' || cam.status === statusFilter;
      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [cameras, searchQuery, areaFilter, statusFilter]);

  const uniqueAreas = ['All', ...new Set(cameras.map(c => c.location_name))];

  const focusedCenter = selectedCamera ? [selectedCamera.latitude, selectedCamera.longitude] : null;
  const focusedZoom = selectedCamera ? 17 : null;

  // Component to render a camera's feed (Used in Map Panel and Grid Panel)
  const CameraPlayer = ({ cam }) => {
    if (cam.status === 'Offline') {
      return (
        <div className="w-full h-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-red-500/80 gap-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none z-10"></div>
          <svg className="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          <span className="font-mono font-bold tracking-widest text-xs">SIGNAL LOST</span>
        </div>
      );
    }
    if (!cam.stream_url) {
      return (
        <div className="w-full h-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-slate-500 gap-2">
          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="font-mono text-xs">LOADING FEED...</span>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-black relative flex items-center justify-center group">
        {cam.isVideo ? (
          <video src={cam.stream_url} autoPlay loop muted className="w-full h-full object-cover" />
        ) : (
          <img src={cam.stream_url} alt="Live Feed" className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded border border-slate-700 backdrop-blur-sm shadow-lg">
           <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
           <span className="text-[9px] font-mono font-bold text-slate-200 tracking-wider">LIVE</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Mumbai Traffic Cameras</h1>
          <p className="text-sm text-slate-400 mt-1">Surveillance nodes mapped to precise coordinates across the Mumbai corridor.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          
          {/* View Toggles */}
          <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg p-1 shadow-lg">
             <button 
                onClick={() => setViewMode('map')} 
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
                <MapIcon /> Map View
             </button>
             <button 
                onClick={() => setViewMode('grid')} 
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
                <GridIcon /> Grid View
             </button>
          </div>

          {/* Data Source Toggles */}
          <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg p-1 shadow-lg">
             <button 
                onClick={() => setFeedSource('api')} 
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${feedSource === 'api' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
                API Snapshot Images
             </button>
             <button 
                onClick={() => setFeedSource('loop')} 
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${feedSource === 'loop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
                Real-Time Video Loop
             </button>
          </div>

          <div className="w-px h-8 bg-slate-700 mx-2 hidden xl:block"></div>

          {/* Stats */}
          <div className="flex gap-2">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
              <span className="text-lg font-bold text-slate-200 font-mono leading-none">{totalCameras}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center">
              <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold">Online</span>
              <span className="text-lg font-bold text-emerald-300 font-mono leading-none">{onlineCameras}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center">
              <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Offline</span>
              <span className="text-lg font-bold text-red-300 font-mono leading-none">{offlineCameras}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Filters Header */}
      <div className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl flex flex-col md:flex-row gap-3 shrink-0 items-center">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search ID or Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg pl-10 p-2 text-slate-200 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <select 
            value={areaFilter} 
            onChange={(e) => setAreaFilter(e.target.value)}
            className="flex-1 md:w-48 bg-slate-950 border border-slate-700 text-sm rounded-lg p-2 text-slate-300 outline-none focus:border-blue-500"
          >
            {uniqueAreas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-32 bg-slate-950 border border-slate-700 text-sm rounded-lg p-2 text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAP VIEW MODE */}
      {/* ========================================================= */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Map View - Left Column (List) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {filteredCameras.length === 0 ? (
              <div className="text-center text-slate-500 text-sm mt-10">No cameras match your filters.</div>
            ) : (
              filteredCameras.map(cam => (
                <button
                  key={cam.camera_id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedCamera?.camera_id === cam.camera_id 
                      ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-bold text-blue-400">{cam.camera_code}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${
                      cam.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cam.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200 truncate">{cam.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate flex gap-2">
                    <span>{cam.direction} • {cam.road_name}</span>
                    {cam.isVideo && cam.status === 'Online' && <span className="text-blue-400 font-bold ml-auto">▶ VIDEO</span>}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Map View - Right Column (Map + Giant Feed) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 min-h-0">
            
            {/* Taller Map */}
            <div className="bg-slate-900 border border-slate-700/80 shadow-lg rounded-xl overflow-hidden flex-1 relative min-h-[300px]">
              <TrafficCameraMap 
                cameras={filteredCameras}
                selectedCamera={selectedCamera}
                onCameraSelect={(cam) => setSelectedCamera(cam)}
              />
            </div>

            {/* Expansive Details & Feed Panel */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden shrink-0 flex flex-col md:flex-row h-72">
              {selectedCamera ? (
                <>
                  <div className="flex flex-col gap-6 p-6 w-full md:w-1/3 border-r border-slate-700/50 overflow-y-auto">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${selectedCamera.status === 'Online' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                        <CameraIcon />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">{selectedCamera.name}</h3>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-1">
                          <span className="text-blue-400">{selectedCamera.camera_code}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Direction</span>
                        <span className="text-slate-200">{selectedCamera.direction}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Coordinates</span>
                        <span className="text-slate-200 font-mono text-xs">{selectedCamera.latitude.toFixed(4)}°, {selectedCamera.longitude.toFixed(4)}°</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Source Engine</span>
                        <span className="text-slate-200 truncate">{selectedCamera.source}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Stream Protocol</span>
                        <span className="text-slate-200 font-mono text-xs">{selectedCamera.stream_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-2/3 h-48 md:h-full bg-black relative">
                     <CameraPlayer cam={selectedCamera} />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-3">
                  <CameraIcon />
                  <span>Select a camera from the list or map to view high-resolution feeds.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GRID VIEW MODE */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {filteredCameras.map(cam => (
            <div key={cam.camera_id} className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-slate-500 transition-colors">
              <div className="h-48 bg-black relative">
                <CameraPlayer cam={cam} />
              </div>
              <div className="p-4 flex flex-col gap-1 border-t border-slate-700/50 bg-slate-900/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-blue-400">{cam.camera_code}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${
                      cam.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cam.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 text-sm truncate">{cam.name}</h3>
                <p className="text-xs text-slate-400 truncate">{cam.direction} • {cam.road_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}