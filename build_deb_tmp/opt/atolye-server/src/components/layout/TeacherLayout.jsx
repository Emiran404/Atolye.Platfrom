import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import Topbar from './Topbar';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <TeacherSidebar />
      <div className="ml-64 transition-all duration-300">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
