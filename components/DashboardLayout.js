import React, { useState } from 'react';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar fixa na lateral esquerda */}
      <Sidebar open={open} />

      {/* Conteúdo principal com margem à esquerda para compensar a sidebar */}
      <main className="flex-1 ml-60 p-6">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
