import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import Topbar from './Topbar';

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <StudentSidebar />
      <div className="ml-60 transition-all duration-300">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
