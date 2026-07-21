import React, { useEffect, useState } from "react";
import L from 'leaflet'; 
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useMapStore } from "../../store/useMapStore";
import { getEnterpriseIcon } from "./iconHelper";

// 1. Interactive Legend & Layer Config
const LAYER_INDICATORS = [
  { id: 'health', label: 'Hospitals / EMS', color: 'bg-red-500' },
  { id: 'police', label: 'Police Stations', color: 'bg-blue-600' },
  { id: 'traffic', label: 'Traffic & CCTVs', color: 'bg-amber-500' },
  { id: 'utilities', label: 'Water & Power', color: 'bg-cyan-500' },
  { id: 'fire', label: 'Fire Departments', color: 'bg-orange-500' },
  { id: 'weather', label: 'Weather Nodes', color: 'bg-sky-500' },
];

// Extracted Popup for clean architecture
const EnterprisePopup = ({ title, type, metadata }) => (
  <div className="w-64 bg-slate-900 text-slate-100 p-3 rounded-lg shadow-xl font-sans">
    <h3 className="font-bold text-md border-b border-slate-700 pb-2 mb-2 truncate text-blue-400">
      {title}
    </h3>
    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
      Type: {type.replace("_", " ")}
    </p>
    <div className="grid grid-cols-2 gap-2 text-sm">
      {Object.entries(metadata).map(([key, val]) => (
        <div key={key} className="flex flex-col bg-slate-800 p-1.5 rounded">
          <span className="text-slate-400 text-xs capitalize">
            {key.replace(/([A-Z])/g, " $1")}
          </span>
          <span className="font-mono text-slate-100">{val}</span>
        </div>
      ))}
    </div>
  </div>
);

const createCustomClusterIcon = (cluster) => {
    // Get the number of markers grouped in this cluster
    const count = cluster.getChildCount();
    
    return L.divIcon({
        html: `<div class="enterprise-cluster">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [45, 45],
        iconAnchor: [22, 22] 
    });
};

const DigitalTwinMap = () => {
  // 2. Destructure activeLayers and toggleLayer from your Zustand store
  const { 
    getFilteredEntities, 
    vehicles, 
    incidents, 
    initializeMap,
    activeLayers,
    toggleLayer
  } = useMapStore();
  
  const visibleEntities = getFilteredEntities();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    fetch("/api/map/data")
      .then((res) => res.json())
      .then((data) => initializeMap(data));
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      
      {/* 3. Floating Layer Buttons & Icon Indicator Panel (z-[1000] keeps it above Leaflet) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button 
          onClick={() => setShowControls(!showControls)}
          className="bg-slate-900/90 text-white px-4 py-2 rounded-lg border border-slate-700 shadow-lg hover:bg-slate-800 transition-colors backdrop-blur-md font-bold text-sm"
        >
          {showControls ? 'Hide Layers' : 'Show Layers & Legend'}
        </button>

        {showControls && (
          <div className="w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 text-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-700 pb-2">
              Map Layers & Legend
            </h4>
            <div className="flex flex-col gap-2">
              {LAYER_INDICATORS.map((layer) => {
                const isActive = activeLayers[layer.id] !== false; // Default to true if undefined
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-950/50 opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon Color Indicator */}
                      <span className={`w-3 h-3 rounded-full ${layer.color} shadow-[0_0_8px_currentColor]`}></span>
                      <span className="text-sm font-medium">{layer.label}</span>
                    </div>
                    
                    {/* Layer Toggle Switch */}
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="flex items-center gap-3 p-1">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]"></span>
                    <span className="text-sm text-slate-400">Critical Incidents (Pulse)</span>
                </div>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={[19.076, 72.8777]}
        zoom={12}
        className="absolute inset-0 z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Layer 1: Static Clustered Entities (Hospitals, Police, Sensors) */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={30} iconCreateFunction={createCustomClusterIcon} disableClusteringAtZoom={8}>
          {visibleEntities.map((entity) => (
            <Marker
              key={entity.entity_id}
              position={[
                parseFloat(entity.latitude),
                parseFloat(entity.longitude),
              ]}
              icon={getEnterpriseIcon(entity.entity_type)}
            >
              <Popup className="enterprise-popup">
                <EnterprisePopup
                  title={entity.name}
                  type={entity.entity_type}
                  metadata={entity.metadata}
                />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Layer 2: Real-time Moving Vehicles (Unclustered for smooth delta animation) */}
        {vehicles.map((v) => (
          <Marker
            key={v.vehicle_id}
            position={[parseFloat(v.current_lat), parseFloat(v.current_lng)]}
            icon={getEnterpriseIcon(v.vehicle_type)}
            eventHandlers={{
              add: (e) =>
                e.target
                  .getElement()
                  .classList.add("transition-all", "duration-1000"),
            }}
          >
            <Popup className="enterprise-popup">
              <EnterprisePopup
                title={`${v.department} Unit`}
                type={v.vehicle_type}
                metadata={{ status: v.status }}
              />
            </Popup>
          </Marker>
        ))}

        {/* Layer 3: Active Incidents (Highest Z-Index, Red Pulse CSS) */}
        {incidents.map((inc) => (
          <Marker
            key={inc.incident_id}
            position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
            icon={getEnterpriseIcon("incident")}
          >
            <Popup className="enterprise-popup border-t-4 border-red-500">
              <EnterprisePopup
                title={inc.incident_type}
                type="Critical Alert"
                metadata={{ severity: inc.severity, status: inc.status }}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DigitalTwinMap;