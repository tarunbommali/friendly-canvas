import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export default function RoleMatrixPage() {
  const permissions = [
    {
      resource: 'Workspaces & Members',
      action: 'Invite & remove members, edit roles',
      admin: true,
      editor: false,
      viewer: false,
    },
    {
      resource: 'Projects',
      action: 'Create & delete curriculum projects',
      admin: true,
      editor: false,
      viewer: false,
    },
    {
      resource: 'Tracks',
      action: 'Create, edit, delete & reorder tracks',
      admin: true,
      editor: true,
      viewer: false,
    },
    {
      resource: 'Posts',
      action: 'Create, edit, delete & reorder posts',
      admin: true,
      editor: true,
      viewer: false,
    },
    {
      resource: 'Slides & Content',
      action: 'Edit headlines, body text & visual directives',
      admin: true,
      editor: true,
      viewer: false,
    },
    {
      resource: 'Canvas Documents',
      action: 'Modify Fabric.js objects, colors & layouts',
      admin: true,
      editor: true,
      viewer: false,
    },
    {
      resource: 'Read & Preview',
      action: 'View projects, posts & export carousel slides',
      admin: true,
      editor: true,
      viewer: true,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Access Control</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-sans">Role Permissions Matrix</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Comprehensive overview of platform access rights and capabilities enforced by backend RBAC middleware.
        </p>
      </div>

      <div className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 dark:bg-slate-900/60 border-b border-gray-100 dark:border-white/10 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="p-4">Domain Area</th>
              <th className="p-4">Capability / Action</th>
              <th className="p-4 text-center">Viewer</th>
              <th className="p-4 text-center">Editor</th>
              <th className="p-4 text-center">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
            {permissions.map((perm, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/40 transition">
                <td className="p-4 font-semibold text-gray-900 dark:text-slate-100">{perm.resource}</td>
                <td className="p-4 text-gray-500 dark:text-slate-400 text-xs">{perm.action}</td>
                <td className="p-4 text-center">
                  {perm.viewer ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {perm.editor ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {perm.admin ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
