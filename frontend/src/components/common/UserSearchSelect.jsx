import React, { useState, useRef, useEffect } from 'react';
import { Search, User, X, Check, Shield, Users, ChevronDown } from 'lucide-react';

export const UserSearchSelect = ({
  users = [],
  value = '',
  onChange,
  placeholder = 'Search & assign team member...',
  disabled = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected user
  const selectedUser = users.find((u) => u.id === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter users by query
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = u.full_name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const roleMatch = u.role?.toLowerCase().includes(query);
    return nameMatch || emailMatch || roleMatch;
  });

  const handleSelect = (userId) => {
    onChange(userId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'ADMIN':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'USER':
      case 'MEMBER':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${compact ? 'inline-block' : 'w-full'}`}>
      {/* Selected Trigger Button */}
      {compact ? (
        <button
          type="button"
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold bg-slate-900/80 border rounded-lg transition cursor-pointer max-w-[150px] truncate ${
            isOpen ? 'border-indigo-500/60 ring-1 ring-indigo-500/30 text-white' : 'border-white/10 text-slate-300 hover:border-white/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0">
            {selectedUser ? selectedUser.full_name?.charAt(0) : <User className="w-2.5 h-2.5 text-slate-500" />}
          </div>
          <span className="truncate">
            {selectedUser ? selectedUser.full_name : 'Assign...'}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <div
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`w-full px-3 py-2 bg-slate-900/70 border rounded-xl flex items-center justify-between gap-2 transition cursor-pointer ${
            isOpen ? 'border-indigo-500/60 ring-2 ring-indigo-500/20' : 'border-white/10 hover:border-white/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {selectedUser ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0">
                  {selectedUser.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className="text-xs font-semibold text-white truncate">
                    {selectedUser.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                    {selectedUser.email}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{placeholder}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {selectedUser && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Remove assignee"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      )}

      {/* Dropdown Floating Search Menu */}
      {isOpen && (
        <div className={`absolute top-full ${compact ? 'right-0 w-64' : 'left-0 right-0'} mt-2 z-50 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10`}>
          {/* Search Input Field */}
          <div className="p-2.5 border-b border-white/10 bg-slate-950/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900/90 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
            {/* Unassign option */}
            <div
              onClick={() => handleSelect('')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                !value
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500">
                  <Users className="w-3 h-3" />
                </div>
                <span>Unassigned (No assignee)</span>
              </div>
              {!value && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isSelected = u.id === value;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelect(u.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-600/25 text-white border border-indigo-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate leading-tight flex items-center gap-1.5">
                          <span>{u.full_name}</span>
                          <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No team members found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchSelect;
