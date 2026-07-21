import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-city-900 text-gray-100 overflow-hidden">
      {/* Global Sidebar Navigation */}
      <Sidebar />
      
      {/* Dynamic Page Content (Changes based on route) */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;