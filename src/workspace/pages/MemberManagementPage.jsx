import React, { useState } from 'react';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { Users, UserPlus, Shield, Check, Trash2, Mail } from 'lucide-react';

export default function MemberManagementPage() {
  const { user, activeWorkspace, activeRole } = useAuthStore();

  const [members, setMembers] = useState([
    {
      id: 'm1',
      name: user?.name || 'Admin Engineer',
      email: user?.email || 'admin@friendlycanvas.dev',
      role: 'admin',
      status: 'Active',
      joined: 'Joined Sep 2026',
    },
    {
      id: 'm2',
      name: 'Sarah Chen',
      email: 'sarah.chen@friendlycanvas.dev',
      role: 'editor',
      status: 'Active',
      joined: 'Joined Sep 2026',
    },
    {
      id: 'm3',
      name: 'Alex Rivera',
      email: 'alex.r@friendlycanvas.dev',
      role: 'viewer',
      status: 'Active',
      joined: 'Joined Sep 2026',
    },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember = {
      id: `m_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited',
      joined: 'Pending acceptance',
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
  };

  const handleDeleteMember = (memberId) => {
    if (confirm('Remove this member from workspace?')) {
      setMembers(members.filter((m) => m.id !== memberId));
    }
  };

  const isAdmin = activeRole === 'admin';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-sans">Member Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage teammates, configure workspace permissions, and audit access levels.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Workspace Members ({members.length})
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 font-mono">Workspace: {activeWorkspace?.name}</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/40 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{member.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        member.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          : member.role === 'editor'
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      {member.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 font-mono">{member.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block">{member.joined}</div>

                {isAdmin && (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="text-xs border border-gray-200 dark:border-white/10 rounded px-2 py-1 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium text-gray-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="admin" className="dark:bg-slate-900">Admin</option>
                    <option value="editor" className="dark:bg-slate-900">Editor</option>
                    <option value="viewer" className="dark:bg-slate-900">Viewer</option>
                  </select>
                )}

                {isAdmin && member.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] border border-gray-200 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Invite Workspace Member</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Send an invitation to join {activeWorkspace?.name || 'Workspace'}.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@domain.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="viewer" className="dark:bg-slate-900">Viewer (Read-only access)</option>
                  <option value="editor" className="dark:bg-slate-900">Editor (Create & edit slides)</option>
                  <option value="admin" className="dark:bg-slate-900">Admin (Full workspace control)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
