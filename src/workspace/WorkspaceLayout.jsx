import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import { useAuthStore } from '../shared/stores/useAuthStore';
import { useThemeStore } from '../shared/stores/useThemeStore';

export default function WorkspaceLayout() {
  const { initialize: initAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initAuth();
    initializeTheme();
  }, [initAuth, initializeTheme]);

  // All workspace views (Projects, Canvas Editor, Content Management, Tracks) share the unified Corporate Modern shell
  return (
    <div className="h-screen flex w-full bg-[#f8fafc] dark:bg-[#0f1117] text-gray-900 dark:text-slate-100 font-sans overflow-hidden">
      <WorkspaceSidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col relative bg-[#f8fafc] dark:bg-[#0f1117]">
        <Outlet />
      </main>
    </div>
  );
}
