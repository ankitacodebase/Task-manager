import React, { useState } from 'react';
import { 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  ExternalLink,
  Building
} from 'lucide-react';

export const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('TECH_SUPPORT');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does TaskFlow handle multiple projects across different departments?',
      a: 'Each organization can create independent projects with custom keys (e.g., DEV, MKT, MOB). Admins can filter tasks by project or view all tasks across the workspace, while project members stay focused on their active deliverables.',
    },
    {
      q: 'Do team members and administrators see updates in real time without refreshing?',
      a: 'Yes! TaskFlow features an active live-sync engine. Whenever a card is dragged to a new status, reassigned, or commented on, the changes broadcast instantly to everyone on that project without anyone needing to refresh their browser.',
    },
    {
      q: 'How do on-card comments work?',
      a: 'Every task card features an integrated discussion box. Team members can post notes, ask questions, and share progress updates directly on the card so context and decisions stay unified with the task.',
    },
    {
      q: 'Can administrators control task assignment and member roles?',
      a: 'Absolutely. Administrators have full oversight to create projects, invite members, assign and reassign tasks, and track organization-wide progress. Team members can view and update their own assigned tasks or claim unassigned work.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative overflow-hidden pt-28 sm:pt-36 pb-20">
      {/* Ambient background glow */}
      <div className="liquid-glow-orb w-[550px] h-[550px] bg-cyan-600/15 top-20 left-1/3" />
      <div className="liquid-glow-orb w-[450px] h-[450px] bg-indigo-600/20 top-[600px] right-10" />

      <div className="max-w-6xl 2xl:max-w-[1600px] 4k:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl 2xl:max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-white/15 text-xs font-semibold text-cyan-300 mb-6 shadow-lg shadow-cyan-500/10">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Support & Consultation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Connect with the{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              TaskFlow Team
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Have questions about organizing your projects, onboarding your team, or custom workflows? We're here to help you get the most out of your workspace.
          </p>
        </div>

        {/* Contact Form & Channel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Left Column: Direct Channels */}
          <div className="space-y-4">
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Dedicated Support</span>
              </div>
              <h3 className="text-base font-bold text-white">Rapid Response SLA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support team is active 24/7 to resolve questions, guide onboarding, and help your team build momentum.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Customer Help Desk</span>
              </div>
              <h3 className="text-base font-bold text-white">support@taskflow.internal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send us inquiries, feature suggestions, or workspace configuration questions anytime.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Team Onboarding</span>
              </div>
              <h3 className="text-base font-bold text-white">Custom Walkthroughs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need guidance structuring your departments, sprints, or multi-project setup? We are ready to assist.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form (Liquid Glass Card) */}
          <div className="lg:col-span-2 liquid-glass-card rounded-3xl p-8 border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-bold text-white mb-1">Direct Engineering Inquiry</h2>
            <p className="text-xs text-slate-400 mb-6">
              Fill out the details below to transmit a message directly to our platform team.
            </p>

            {submitted ? (
              <div className="p-8 text-center space-y-3 liquid-glass rounded-2xl border border-emerald-500/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Inquiry Received</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Your message regarding <strong>{department}</strong> has been logged. Our engineering lead will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Engineer"
                      className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Topic / Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  >
                    <option value="TECH_SUPPORT">Technical & Architecture Support</option>
                    <option value="SECURITY">Security & Vulnerability Disclosure</option>
                    <option value="ENTERPRISE">Enterprise Deployment & Migration</option>
                    <option value="CONSULTATION">General Engineering Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Message / Specifications *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your architecture requirements, questions, or inquiry..."
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full liquid-button py-3.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              Frequently Addressed Questions
            </h2>
            <h3 className="text-2xl font-bold text-white">Platform Architectural Details</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="liquid-glass rounded-2xl border border-white/10 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between text-xs font-bold text-white hover:text-indigo-300 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
