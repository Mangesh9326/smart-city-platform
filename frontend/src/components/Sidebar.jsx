import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Command Center', path: '/' },
    { name: 'Traffic Control', path: '/traffic' },
    { name: 'Hospital Logistics', path: '/hospital' },
    { name: 'Police Dispatch', path: '/police' },
    { name: 'Fire & Rescue', path: '/fire' },
    { name: 'Utility Grid', path: '/utility' },
  ];

  return (
    <aside className="w-64 h-screen glass-panel rounded-none border-y-0 border-l-0 border-city-700/50 flex flex-col">
      <div className="p-6 border-b border-city-700/50">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          AI CityOS
        </h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">v2.0.26</p>
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">
          Modules
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                  : 'text-gray-400 hover:bg-city-800 hover:text-gray-200'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-city-700/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold">
            A
          </div>
          <div>
            <div className="text-sm font-medium text-gray-200">Admin User</div>
            <div className="text-xs text-gray-500">System Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;