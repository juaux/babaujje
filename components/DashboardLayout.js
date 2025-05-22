import React from 'react';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-100">
      <Sidebar open={true} />
      <main className="flex-1 ml-60 p-6">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;