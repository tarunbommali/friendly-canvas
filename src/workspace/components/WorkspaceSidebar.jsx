import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import { useThemeStore } from '../../shared/stores/useThemeStore';
import {
  FolderKanban,
  Users,
  ShieldCheck,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

export default function WorkspaceSidebar() {
  const { user, activeWorkspace, activeRole, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Detect if currently on the canvas editor studio route
  const isCanvasEditor =
    location.pathname === '/canvas-editor' ||
    location.pathname.includes('/design/');

  // Automatically reset hover state on route change
  useEffect(() => {
    setIsHovered(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  const navLinks = [
    { to: '/', label: 'Projects', icon: FolderKanban, end: true },
    { to: '/canvas-editor', label: 'Canvas Editor', icon: Presentation },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/roles', label: 'Role Permissions', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Edge Hover Hotspot Detector for Canvas Editor */}
      {isCanvasEditor && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          className="fixed left-0 top-0 bottom-0 w-3.5 z-40 cursor-e-resize"
          title="Hover left edge to open navigation menu"
        />
      )}

      {/* Main Workspace Sidebar */}
      <aside
        onMouseEnter={() => isCanvasEditor && setIsHovered(true)}
        onMouseLeave={() => isCanvasEditor && setIsHovered(false)}
        className={`${
          isCollapsed ? 'w-16' : 'w-[280px]'
        } bg-white dark:bg-[#151821] border-r border-[#e2e8f0] dark:border-white/10 flex flex-col justify-between select-none ${
          isCanvasEditor
            ? `fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-out shadow-2xl ${
                isHovered ? 'translate-x-0' : '-translate-x-full pointer-events-none'
              }`
            : 'h-screen sticky top-0 shrink-0 transition-all duration-200 z-50 shadow-xs'
        }`}
      >
        {/* Top Header & Navigation */}
        <div>
          <div
            className={`p-4 border-b border-[#e2e8f0] dark:border-white/10 flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                    {activeWorkspace?.name || 'Friendly Workspace'}
                  </h2>
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
                    {activeRole} ACCESS
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3">
            {!isCollapsed && (
              <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                Workspace
              </div>
            )}
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => isCanvasEditor && setIsHovered(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                      } rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 font-semibold'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer: Theme Toggle + User Session */}
        <div className="p-3 border-t border-[#e2e8f0] dark:border-white/10 space-y-2">
          {/* Theme Toggle Button */}
          {isCollapsed ? (
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-[#1c202d] border border-gray-200 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all cursor-pointer shadow-2xs group"
              title="Toggle Dark / Light Theme"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                  {isDark ? 'Dark Theme' : 'Light Theme'}
                </span>
              </div>
              {/* Toggle Switch */}
              <div
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shadow-inner ${
                  isDark ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    isDark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          )}

          {/* User Session Footer */}
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                  {(user?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
                    {user?.name || 'Admin User'}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono truncate">
                    {user?.email || 'admin@domain.com'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
