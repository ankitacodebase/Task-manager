import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  User, 
  Mail, 
  Calendar, 
  Search, 
  CheckCircle2,
  Building,
  Crown
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const TeamManagement = ({ users: propUsers, onOpenCreateUser: propOnOpenCreateUser }) => {
  const workspace = useWorkspace();
  const users = propUsers || workspace.users;
  const onOpenCreateUser = propOnOpenCreateUser || (() => workspace.setIsUserModalOpen(true));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="liquid-glass p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="liquid-glow-orb w-64 h-64 bg-indigo-600/20 top-0 left-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Organization Members</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Directory & Access Control</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Manage organization team members, inspect RBAC privileges, and assign workspace duties.
          </p>
        </div>

        <button
          onClick={onOpenCreateUser}
          className="liquid-button relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member by name, email or role..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-white">{filteredUsers.length}</span> of {users.length} members
        </div>
      </div>

      {/* Members Table */}
      <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">System Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.03] transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shadow-xs ${
                          member.role === 'SUPER_ADMIN'
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-400/40 text-white shadow-amber-500/20'
                            : member.role === 'ADMIN' 
                              ? 'bg-purple-600/80 border border-purple-400/30' 
                              : 'bg-indigo-600/80 border border-indigo-400/30'
                        }`}>
                          {member.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">
                            {member.full_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: {member.id?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{member.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {member.role === 'SUPER_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Crown className="w-3 h-3 text-amber-400" /> Super Admin
                        </span>
                      ) : member.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          <Shield className="w-3 h-3 text-purple-400" /> Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10">
                          <User className="w-3 h-3 text-slate-400" /> Team Member
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Active Member'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
