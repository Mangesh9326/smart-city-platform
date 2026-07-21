import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { mainSidebar } from '../navigation/navigationConfig';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-city-900 text-gray-100 overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="h-16 glass-panel rounded-none border-t-0 border-x-0 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl text-blue-400">AI CityOS</span>
          <input type="text" placeholder="Global Search..." className="bg-city-800 border border-city-700 rounded px-3 py-1 text-sm" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-400">System Nominal</span>
          <span>72°F Clear</span>
          <button className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">AI Assistant</button>
          <div className="w-8 h-8 rounded-full bg-indigo-500/50 flex items-center justify-center">A</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* MAIN SIDEBAR (Level 1) */}
        <aside className="w-64 flex-shrink-0 glass-panel rounded-none border-y-0 border-l-0 overflow-y-auto">
          <nav className="p-4 flex flex-col gap-2">
            {mainSidebar.map((item) => (
              <NavLink 
                key={item.title} 
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:bg-city-800'}`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* DYNAMIC CENTER CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Outlet />
        </main>

        {/* GLOBAL RIGHT PANEL (Level 3 - Context) */}
        <aside className="w-72 flex-shrink-0 glass-panel rounded-none border-y-0 border-r-0 flex flex-col">
           <div className="p-4 border-b border-city-700/50 font-bold text-sm text-gray-300 uppercase">Live Operations</div>
           <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-red-400">
                🚨 Accident Detected: MG Road
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded text-sm text-indigo-300">
                🤖 AI Action: Diverting Traffic
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
}