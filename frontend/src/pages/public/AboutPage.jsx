import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Target, 
  Users, 
  Layers, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  HeartHandshake,
  Workflow,
  Compass
} from 'lucide-react';

export const AboutPage = ({ onNavigate }) => {
  const navigate = useNavigate();

  const handleNav = (path, viewId) => {
    if (navigate) navigate(path);
    else if (onNavigate) onNavigate(viewId);
  };

  return (
    <div className="relative overflow-hidden pt-28 sm:pt-36 pb-20 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Fluid Glow */}
      <div className="liquid-glow-orb w-[600px] h-[600px] bg-purple-600/15 top-20 right-1/4" />
      <div className="liquid-glow-orb w-[500px] h-[500px] bg-indigo-600/20 top-[500px] left-10" />

      <div className="max-w-6xl 2xl:max-w-[1600px] 4k:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl 2xl:max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-white/15 text-xs font-semibold text-purple-300 mb-6 shadow-lg shadow-purple-500/10">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Our Product Story & Vision</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            We Believe Work Should Be{' '}
            <span className="bg-gradient-to-r from-purple-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Fast, Focused & Frictionless
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            TaskFlow was founded with a singular purpose: to free teams from bloated, sluggish software and return focus to what truly matters—building great things and delivering on time.
          </p>
        </div>

        {/* 1. The Core Philosophy (4 Pillar Cards) */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Our Core Principles</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Built Around How Teams Actually Think</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="liquid-glass-card rounded-3xl p-8 border border-white/10 space-y-3.5 hover:border-indigo-500/30 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Speed as a Core Feature</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project management tools should never feel like a chore. Every click, card drag, filter, and assignment in TaskFlow responds in milliseconds, keeping you in complete creative flow state.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="liquid-glass-card rounded-3xl p-8 border border-white/10 space-y-3.5 hover:border-purple-500/30 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Real-Time Synchronicity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work happens together, not in silos. When a team member marks a task done or posts a question, administrators and peers see the update instantly without ever needing to hit refresh.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="liquid-glass-card rounded-3xl p-8 border border-white/10 space-y-3.5 hover:border-sky-500/30 transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Contextual Communication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No more chasing updates across buried chat threads. With discussions integrated directly onto task cards, project context, history, and feedback live right where the work happens.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="liquid-glass-card rounded-3xl p-8 border border-white/10 space-y-3.5 hover:border-emerald-500/30 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Deep Multi-Project Organization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Whether you manage three internal development sprints or ten client accounts, TaskFlow separates your projects cleanly with custom keys, dedicated counters, and focused filters.
              </p>
            </div>
          </div>
        </div>

        {/* 2. The TaskFlow Difference (Comparison) */}
        <div className="mb-20 liquid-glass-card rounded-3xl p-8 sm:p-12 border border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">The Difference</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Why Modern Teams Choose TaskFlow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <span>✕</span>
                <h4>The Legacy Tool Experience</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Overwhelming configuration panels with 50 settings before getting started.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Constant manual page refreshes just to see if teammates moved tasks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Feedback scattered across external chat channels and buried emails.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Cluttered views where members cannot easily find what they are assigned to.</span>
                </li>
              </ul>
            </div>

            {/* The TaskFlow Way */}
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>✓</span>
                <h4>The TaskFlow Experience</h4>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Ready in under 60 seconds. Create a project, invite your team, and ship.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>100% instant live sync: moves and status updates broadcast in real time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>On-card discussions preserve context and decision history forever.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Role-focused clarity: Admins see the full picture; members see their tasks.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Team Values */}
        <div className="mb-20 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">What Drives Us</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-8">Our Core Commitments</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-2">
              <div className="text-indigo-400 font-bold text-sm flex items-center gap-2">
                <HeartHandshake className="w-4 h-4" />
                <span>Simplicity by Default</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We believe true sophistication lies in restraint. We continuously refine the user interface so you spend time doing work, not managing it.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-2">
              <div className="text-purple-400 font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Respect for Flow</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interruptions kill productivity. Our fluid liquid glass design and seamless real-time updates keep your focus sharp and your workflow uninterrupted.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Reliability & Polish</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                From keyboard navigation to atomic task numbering, every detail is engineered with precision to ensure your organization runs smoothly.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Call to Action */}
        <div className="text-center liquid-glass-card rounded-3xl p-10 sm:p-14 border border-white/15">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Experience Seamless Workflow Today</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Join forward-thinking teams already using TaskFlow to stay coordinated and ship faster.
          </p>
          <button
            onClick={() => handleNav('/register', 'register')}
            className="mt-6 liquid-button px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition"
          >
            <span>Create Organization Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
