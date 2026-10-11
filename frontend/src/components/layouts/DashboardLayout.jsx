import React from 'react';
import { Outlet } from 'react-router-dom';
import { WorkspaceProvider } from '../../context/WorkspaceContext';

export const DashboardLayout = () => {
  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
};

export default DashboardLayout;
