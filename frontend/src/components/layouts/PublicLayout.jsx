import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../public/PublicNavbar';
import PublicFooter from '../public/PublicFooter';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background ambient liquid glow orbs */}
      <div className="liquid-glow-orb w-[600px] h-[600px] bg-indigo-600/20 -top-40 -left-40" />
      <div className="liquid-glow-orb w-[500px] h-[500px] bg-purple-600/20 top-1/3 -right-40" />
      <div className="liquid-glow-orb w-[600px] h-[600px] bg-pink-600/15 -bottom-40 left-1/4" />

      {/* Floating Glass Navbar */}
      <PublicNavbar />

      {/* Child Route Outlet */}
      <main className="flex-1 relative z-10 pt-20">
        <Outlet />
      </main>

      {/* Glass Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
