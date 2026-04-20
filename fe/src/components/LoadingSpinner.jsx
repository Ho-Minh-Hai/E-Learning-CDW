import React from 'react';
import { BookOpen } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-30 rounded-full animate-pulse" />
            <div className="relative w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600 font-medium">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
};

export default LoadingSpinner;
