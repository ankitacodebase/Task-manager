import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Kanban, Users, FolderKanban, MessageSquare, ArrowRight } from 'lucide-react';

export const PublicFooter = ({ onNavigate }) => {
  const navigate = useNavigate();

  const handleNav = (path, id) => {
    if (navigate) {
      navigate(path);
    } else if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <footer className="mt-24 border-t border-white/10 relative overflow-hidden bg-slate-950/80">
      {/* Ambient background glow */}
      <div className="liquid-glow-orb w-[500px] h-[250px] bg-indigo-600/10 top-0 left-1/2 -translate-x-1/2" />

      <div className="max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">TaskFlow Workspaces</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The modern project management suite for high-performance teams. Fluid Kanban boards, multi-project organization, and real-time live synchronization.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Cloud Services Active</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => handleNav('/', 'home')} className="hover:text-white transition cursor-pointer">
                  Platform Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/about', 'about')} className="hover:text-white transition cursor-pointer">
                  Our Story & Mission
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/contact', 'contact')} className="hover:text-white transition cursor-pointer">
                  Support & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/register', 'register')} className="hover:text-indigo-400 transition cursor-pointer">
                  Create Workspace
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Workspace Features</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Kanban className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visual Kanban Drag & Drop</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                <span>Multi-Project Separation</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Instant Live Sync</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>On-Card Discussion Threads</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TaskFlow Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for velocity and frictionless collaboration.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
