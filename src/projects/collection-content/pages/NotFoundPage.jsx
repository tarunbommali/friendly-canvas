import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6 font-sans">
      <div className="p-8 md:p-12 rounded-2xl bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 flex flex-col items-center text-center gap-4 max-w-md shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-mono font-bold text-4xl text-gray-900 dark:text-slate-100 leading-none">
          404
        </h1>
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Page Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm leading-relaxed">
          The curriculum collection, post, or resource you are looking for does not exist or has been relocated.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Workspace Home</span>
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            onClick={() => navigate('/swe-notebook/content')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Curriculum Collections</span>
          </button>
        </div>
      </div>
    </div>
  );
}
