import React from 'react';
import StudentSidebar from '../layout/StudentSidebar';

const StudentLayout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f6f6f8',
      fontFamily: 'Lexend, sans-serif'
    }}>
      <StudentSidebar />
      {/* Content Area */}
      <div style={{
        marginLeft: '288px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;
