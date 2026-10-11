import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Kanban, 
  FolderKanban, 
  Users, 
  MessageSquare, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Check, 
  Layers, 
  SlidersHorizontal,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  const navigate = useNavigate();

  const handleNav = (path, viewId) => {
    if (navigate) navigate(path);
    else if (onNavigate) onNavigate(viewId);
  };

  return (
    <div className="relative overflow-hidden pt-28 sm:pt-36 pb-20 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Fluid Glow Elements */}
      <div className="liquid-glow-orb w-[650px] h-[650px] bg-indigo-600/20 top-10 left-1/2 -translate-x-1/2" />
      <div className="liquid-glow-orb w-[500px] h-[500px] bg-fuchsia-600/15 top-80 right-10" />
      <div className="liquid-glow-orb w-[600px] h-[450px] bg-cyan-500/15 top-[650px] left-10" />

      {/* 1. Hero Section */}
      <section className="max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Shimmer Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-white/15 text-xs font-semibold text-indigo-300 mb-8 shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The Next-Generation Project & Task Workspace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl 2xl:max-w-6xl mx-auto leading-[1.14]">
          Bring Total Clarity to Work.{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
            Accelerate How Your Team Ships.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed font-normal">
          Organize multiple projects, drag and drop tasks on interactive Kanban boards, and collaborate in real-time. Experience seamless teamwork without unnecessary clutter or sluggish page reloads.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleNav('/register', 'register')}
            className="liquid-button px-8 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 shadow-xl shadow-indigo-600/30 cursor-pointer hover:scale-[1.02] transition"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleNav('/about', 'about')}
            className="liquid-glass px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 hover:text-white border border-white/10 hover:border-white/20 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Our Product Story</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 2. Live Interactive Mockup Showcase */}
        <div className="mt-12 sm:mt-20 max-w-5xl 2xl:max-w-7xl mx-auto liquid-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
          {/* Mockup Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 pl-2">
                <span className="text-xs font-mono text-slate-300 font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  📁 Mobile App Redesign (MOB)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                12 Tasks Active
              </span>
            </div>
          </div>

          {/* Liquid Mockup Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Column 1: TODO */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Circle className="w-3.5 h-3.5" />
                  <span>To Do</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">2</span>
              </div>

              {/* Task Card 1 */}
              <div className="liquid-glass rounded-xl p-3.5 border border-white/10 space-y-2 hover:border-indigo-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    MOB-101
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    Urgent
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">Design New Onboarding Flow</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">Create interactive interactive screens for first-time user walkthrough.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[9px]">S</div>
                    <span>Sarah K.</span>
                  </div>
                  <span className="flex items-center gap-1 text-indigo-300 font-semibold">
                    <MessageSquare className="w-2.5 h-2.5" /> 3 comments
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="bg-white/[0.02] border border-sky-500/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-300 pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">1</span>
              </div>

              {/* Task Card 2 */}
              <div className="liquid-glass rounded-xl p-3.5 border border-sky-500/30 space-y-2 shadow-lg shadow-sky-500/10">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    MOB-098
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    High
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">Push Notification Engine</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">Connect instant alerts for task assignments and team comments.</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-[9px]">M</div>
                    <span>Michael T.</span>
                  </div>
                  <span className="flex items-center gap-1 text-sky-300 font-semibold">
                    <MessageSquare className="w-2.5 h-2.5" /> 5 comments
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: DONE */}
            <div className="bg-white/[0.02] border border-emerald-500/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300 pb-2 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">1</span>
              </div>

              {/* Task Card 3 */}
              <div className="liquid-glass rounded-xl p-3.5 border border-emerald-500/20 space-y-2 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MOB-092
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                    Verified
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-300 line-through leading-snug">Fluid Drag-and-Drop Board</h4>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                  <span>Delivered on time</span>
                  <span className="text-[10px] flex items-center gap-1">Shipped ✔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Product Features Grid */}
      <section className="max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built for High Performance</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Everything Your Team Needs to Build & Ship
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Intuitive by design, fast by default. Discover features designed to eliminate friction and keep your team in the flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-indigo-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual Kanban Boards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track tasks across customizable workflow columns. Drag and drop cards seamlessly between stages with instant real-time status transitions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-purple-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Project Separation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize multiple projects or clients under one roof. Each project gets dedicated sequential task codes and isolated filter views.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-sky-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Real-Time Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a team member updates a card or changes status, your screen updates instantly without needing to manually refresh your browser.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">On-Card Discussions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep conversations contextual. Add notes, feedback, and answers right on the card so work history and rationale are never lost.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Team Oversight</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admins enjoy complete visibility over workspace progress, while team members enjoy a focused dashboard displaying their assigned priorities.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="liquid-glass-card rounded-3xl p-7 border border-white/10 space-y-4 hover:border-fuchsia-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shadow-md">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Advanced Search & Filtering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch effortlessly between Kanban boards and clean paginated tables. Filter by priority, assignee, deadline, or search query in milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How Teams Work (3-Step Flow) */}
      <section className="max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10">
        <div className="liquid-glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Streamlined Process</span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">From Idea to Delivery in 3 Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-indigo-600/30">
                1
              </div>
              <h4 className="text-base font-bold text-white">Create & Organize</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create projects on the fly with unique identifier tags. Add tasks with due dates, priority tiers, and rich descriptions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-purple-600/30">
                2
              </div>
              <h4 className="text-base font-bold text-white">Assign & Collaborate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign teammates with searchable pickers. Discuss progress and leave inline comments visible across your entire organization.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h4 className="text-base font-bold text-white">Execute & Ship</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Move cards smoothly through development and review to completion. Gain full visibility into deadlines and workload balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics Banner */}
      <section className="max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
        <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-300">100%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Live Synced Without Refresh</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">Multi-Project</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Dedicated Project Spaces</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-300">Fluid</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Kanban & Table Views</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">&lt; 100ms</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Instant Interactive Response</p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Card */}
      <section className="max-w-5xl 2xl:max-w-6xl 4k:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 relative z-10 text-center">
        <div className="liquid-glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-14 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Upgrade Your Team's Productivity?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Register your organization workspace in less than a minute and experience a faster, clearer way to work.
            </p>
            <div className="pt-4">
              <button
                onClick={() => handleNav('/register', 'register')}
                className="liquid-button px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition"
              >
                <span>Get Started Now — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
