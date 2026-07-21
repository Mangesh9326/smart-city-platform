import React from 'react';

export default function TrafficCameras() {
  const cameraFeeds = [
    { id: 'CAM-01', location: 'MG Road Junction', status: 'Recording', aiActive: true },
    { id: 'CAM-02', location: 'Station Road', status: 'Recording', aiActive: true },
    { id: 'CAM-03', location: 'River Bridge', status: 'Offline', aiActive: false },
    { id: 'CAM-04', location: 'Highway Exit 4', status: 'Recording', aiActive: true },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">CCTV & YOLO Monitoring</h1>
          <p className="text-sm text-gray-400 mt-1">Live feeds with offline-processed object detection bounding boxes</p>
        </div>
        <div className="text-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded">
          AI Pipeline: Active
        </div>
      </header>

      {/* CCTV Grid */}
      <div className="grid grid-cols-2 gap-4 flex-grow">
        {cameraFeeds.map((cam) => (
          <div key={cam.id} className="glass-panel flex flex-col overflow-hidden relative">
            
            {/* Feed Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10 flex justify-between items-start">
              <div>
                <div className="font-mono text-sm text-gray-200 font-bold">{cam.id} - {cam.location}</div>
                {cam.aiActive && <div className="text-xs text-blue-400 mt-1">YOLOv8 Active</div>}
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded border ${cam.status === 'Recording' ? 'bg-red-500/20 text-red-400 border-red-500/50 flex items-center gap-2' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                {cam.status === 'Recording' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                {cam.status}
              </div>
            </div>

            {/* Video Player Placeholder */}
            <div className="flex-grow bg-black flex items-center justify-center text-city-700 border-b border-city-700/50">
               {cam.status === 'Recording' ? '[ Prerecorded Video with Timestamps Replaying ]' : 'NO SIGNAL'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}