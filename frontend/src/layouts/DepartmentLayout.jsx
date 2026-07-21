import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function DepartmentLayout({ title, sidebarConfig }) {
  return (
    <div className="flex h-full w-full">
      
      {/* SECONDARY DEPARTMENT SIDEBAR (Level 2) */}
      <aside className="w-56 glass-panel rounded-none border-y-0 border-l-0 bg-city-800/30 flex flex-col">
        <div className="p-4 border-b border-city-700/50 font-bold text-gray-200">
          {title} Operations
        </div>
        <nav className="p-4 flex flex-col gap-2 overflow-y-auto">
          {sidebarConfig.map((item) => (
            <NavLink 
              key={item.title} 
              to={item.path}
              end={item.path === `/${title.toLowerCase()}`}
              className={({ isActive }) => 
                `px-3 py-2 rounded text-sm transition-colors ${isActive ? 'bg-city-700 text-white' : 'text-gray-400 hover:text-gray-200'}`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* DEPARTMENT CONTENT AREA */}
      <section className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </section>
      
    </div>
  );
}